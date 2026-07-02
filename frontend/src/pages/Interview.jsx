// src/pages/Interview.jsx
import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { api } from '../api';

const STAGE = {
  STARTING: 'starting',
  CONNECTING: 'connecting',
  ACTIVE: 'active',
  ENDED: 'ended',
  GENERATING: 'generating',
  DONE: 'done',
  ERROR: 'error',
};

export default function Interview({ interviewType, onBackToDashboard }) {
  const [stage, setStage] = useState(STAGE.STARTING);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [feedback, setFeedback] = useState(null);
  const vapiRef = useRef(null);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function begin() {
      try {
        // Step 1: backend me session banao
        const session = await api.startSession(interviewType);
        sessionIdRef.current = session.session_id;

        if (cancelled) return;

        // Step 2: Vapi client banao aur call start karo
        const vapi = new Vapi(session.vapi_public_key);
        vapiRef.current = vapi;

        vapi.on('call-start', () => setStage(STAGE.ACTIVE));
        vapi.on('call-end', () => {
          setStage(STAGE.GENERATING);
          pollForFeedback();
        });
        vapi.on('speech-start', () => setIsSpeaking(true));
        vapi.on('speech-end', () => setIsSpeaking(false));
        vapi.on('error', (e) => {
          console.error('Vapi error:', e);
          setErrorMsg('Something went wrong with the voice call. Please try again.');
          setStage(STAGE.ERROR);
        });

        setStage(STAGE.CONNECTING);
        vapi.start(session.vapi_assistant_id, {
          metadata: { session_id: session.session_id },
        });
      } catch (err) {
        setErrorMsg(err.message);
        setStage(STAGE.ERROR);
      }
    }

    begin();

    return () => {
      cancelled = true;
      vapiRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pollForFeedback() {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    // Webhook ko process hone me kuch second lagte hain, isliye poll karte hain
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const data = await api.getSession(sessionId);
        if (data.session.status === 'completed') {
          setFeedback(data.session.feedback_report);
          setStage(STAGE.DONE);
          return;
        }
      } catch (err) {
        // ignore aur retry karte raho
      }
    }
    // Bahut time lag gaya toh bhi dashboard se dekh sakte hain baad me
    setStage(STAGE.DONE);
  }

  function endCall() {
    vapiRef.current?.stop();
  }

  if (stage === STAGE.ERROR) {
    return (
      <div className="container">
        <div className="error-box">{errorMsg}</div>
        <button className="btn btn-secondary" onClick={onBackToDashboard}>
          Back to dashboard
        </button>
      </div>
    );
  }

  if (stage === STAGE.DONE) {
    return (
      <div className="container">
        <h2 style={{ marginBottom: 24 }}>Your feedback report</h2>
        {!feedback && (
          <div className="card" style={{ color: 'var(--ink-soft)' }}>
            Your feedback is still being generated. Go back to the dashboard and check again in a moment.
          </div>
        )}
        {feedback && !feedback.parse_error && (
          <div className="card">
            <div className="score-circle">{feedback.overall_score}/10</div>
            <p style={{ textAlign: 'center', color: 'var(--ink-soft)', marginBottom: 24 }}>{feedback.summary}</p>

            <div className="feedback-section">
              <h3>Strengths</h3>
              <ul>
                {feedback.strengths?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-section">
              <h3>Areas to improve</h3>
              <ul>
                {feedback.areas_to_improve?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-section">
              <h3>Communication notes</h3>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{feedback.communication_notes}</p>
            </div>
          </div>
        )}
        <button className="btn btn-primary btn-block" style={{ marginTop: 24 }} onClick={onBackToDashboard}>
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="call-screen">
        <div className={`waveform ${stage === STAGE.ACTIVE && isSpeaking ? '' : 'idle'}`}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bar" />
          ))}
        </div>

        <p className="status-text">
          {stage === STAGE.STARTING && 'Setting up your interview…'}
          {stage === STAGE.CONNECTING && 'Connecting to your interviewer…'}
          {stage === STAGE.ACTIVE && (isSpeaking ? 'Interviewer speaking' : 'Listening to you')}
          {stage === STAGE.GENERATING && 'Generating your feedback report…'}
        </p>

        {stage === STAGE.ACTIVE && (
          <button className="btn btn-secondary" style={{ marginTop: 32 }} onClick={endCall}>
            End interview
          </button>
        )}
      </div>
    </div>
  );
}
