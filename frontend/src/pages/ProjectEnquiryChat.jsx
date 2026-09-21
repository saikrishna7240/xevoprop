import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Send,
  Loader2,
  MessageSquare,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../lib/api";
import "./ProjectEnquiryChat.css";

export default function ProjectEnquiryChat() {
  const { id } = useParams();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);

  const [enquiry, setEnquiry] = useState(null);
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const [currentUser, setCurrentUser] =
    useState(null);

  /* ============================================================
     LOAD CURRENT USER
  ============================================================ */

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("xevoprop_user");

      if (storedUser) {
        setCurrentUser(
          JSON.parse(storedUser)
        );
      }
    } catch (error) {
      console.error(
        "User parsing error:",
        error
      );
    }
  }, []);

  /* ============================================================
     LOAD CHAT
  ============================================================ */

  const loadChat = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch(
        `/enquiries/project/${id}/messages`
      );

      setEnquiry(data?.enquiry || null);
      setMessages(data?.messages || []);
    } catch (err) {
      console.error(
        "Project enquiry chat error:",
        err
      );

      setError(
        err.message ||
          "Failed to load conversation."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadChat();
    }
  }, [id]);

  /* ============================================================
     SCROLL TO LAST MESSAGE
  ============================================================ */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* ============================================================
     SEND MESSAGE
  ============================================================ */

  const sendMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage =
      message.trim();

    if (!trimmedMessage || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const data = await apiFetch(
        `/enquiries/project/${id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedMessage,
          }),
        }
      );

      if (data?.chatMessage) {
        setMessages((current) => [
          ...current,
          data.chatMessage,
        ]);
      }

      setMessage("");
    } catch (err) {
      console.error(
        "Send project enquiry message error:",
        err
      );

      setError(
        err.message ||
          "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  /* ============================================================
     STATUS
  ============================================================ */

  const getStatusIcon = () => {
    if (enquiry?.status === "resolved") {
      return <CheckCircle2 size={15} />;
    }

    if (enquiry?.status === "contacted") {
      return <Clock3 size={15} />;
    }

    return <MessageSquare size={15} />;
  };

  const getStatusLabel = () => {
    if (enquiry?.status === "resolved") {
      return "Resolved";
    }

    if (enquiry?.status === "contacted") {
      return "Contacted";
    }

    return "New";
  };

  /* ============================================================
     DATE
  ============================================================ */

  const formatMessageTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="project-chat-loading-page">
        <div className="project-chat-loading">
          <Loader2
            size={34}
            className="project-chat-loading-icon"
          />

          <p>
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error && !enquiry) {
    return (
      <div className="project-chat-error-page">
        <div className="project-chat-error-box">
          <MessageSquare size={30} />

          <h2>
            Unable to open conversation
          </h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!enquiry) {
    return null;
  }

  return (
    <div className="project-chat-page">

      <div className="project-chat-container">

        {/* HEADER */}

        <header className="project-chat-header">

          <button
            type="button"
            className="project-chat-back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="project-chat-project">

            <div className="project-chat-project-image">
              {enquiry.project_image ? (
                <img
                  src={enquiry.project_image}
                  alt={enquiry.project_name}
                />
              ) : (
                <Building2 size={25} />
              )}
            </div>

            <div>
              <span>PROJECT ENQUIRY</span>

              <h1>
                {enquiry.project_name ||
                  "Project"}
              </h1>

              <p>
                <MapPin size={14} />

                {enquiry.project_location ||
                  "Location unavailable"}
              </p>
            </div>

          </div>

          <div
            className={`project-chat-status ${enquiry.status || "new"}`}
          >
            {getStatusIcon()}

            {getStatusLabel()}
          </div>

        </header>

        {/* ERROR */}

        {error && (
          <div className="project-chat-inline-error">
            {error}
          </div>
        )}

        {/* CHAT */}

        <main className="project-chat-main">

          <div className="project-chat-info">
            <MessageSquare size={16} />

            <span>
              You are discussing this project
              enquiry with the developer.
            </span>
          </div>

          <div className="project-chat-messages">

            {messages.length === 0 ? (
              <div className="project-chat-empty">

                <div>
                  <MessageSquare size={25} />
                </div>

                <h2>
                  Start the conversation
                </h2>

                <p>
                  Send a message to continue
                  discussing this project.
                </p>

              </div>
            ) : (
              messages.map((chatMessage) => {

                const isMine =
                  Number(
                    chatMessage.sender_id
                  ) ===
                  Number(
                    currentUser?.id
                  );

                return (
                  <div
                    key={chatMessage.id}
                    className={`project-chat-message-row ${
                      isMine
                        ? "mine"
                        : "theirs"
                    }`}
                  >

                    <div className="project-chat-message">

                      {!isMine && (
                        <span className="project-chat-sender">
                          {chatMessage.sender_name ||
                            "Developer"}
                        </span>
                      )}

                      <p>
                        {chatMessage.message}
                      </p>

                      <time>
                        {formatMessageTime(
                          chatMessage.created_at
                        )}
                      </time>

                    </div>

                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* INPUT */}

          <form
            className="project-chat-input-area"
            onSubmit={sendMessage}
          >
            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Type your message..."
              rows={1}
              disabled={sending}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage(event);
                }
              }}
            />

            <button
              type="submit"
              disabled={
                sending ||
                !message.trim()
              }
            >
              {sending ? (
                <Loader2
                  size={18}
                  className="project-chat-send-spinner"
                />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>

          <p className="project-chat-hint">
            Press Enter to send · Shift + Enter
            for a new line
          </p>

        </main>

      </div>
    </div>
  );
}