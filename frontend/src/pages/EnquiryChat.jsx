import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Send,
  User,
  Building2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import "./EnquiryChat.css";

const API_URL = "https://xevoprop.onrender.com/api";

function EnquiryChat() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        if (!id) {
          setError("Invalid enquiry.");
          return;
        }

        const response = await fetch(
          `${API_URL}/enquiries/${id}/messages`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load conversation."
          );
        }

        if (!cancelled) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Load conversation error:", err);

          setError(
            err.message || "Unable to load conversation."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const sendMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/enquiries/${id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: trimmedMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to send message."
        );
      }

      if (data.chatMessage) {
        setMessages((previousMessages) => [
          ...previousMessages,
          data.chatMessage,
        ]);
      }

      setMessage("");
    } catch (err) {
      console.error("Send message error:", err);

      setError(
        err.message || "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getCurrentUserId = () => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        return Number(user.id);
      } catch {
        // Ignore invalid stored user data.
      }
    }

    const storedUserId = localStorage.getItem("userId");

    return storedUserId ? Number(storedUserId) : null;
  };

  const currentUserId = getCurrentUserId();

  return (
    <div className="enquiry-chat-page">
      <div className="enquiry-chat-container">

        {/* HEADER */}

        <div className="chat-header">
          <button
            type="button"
            className="chat-back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="chat-title">
            <div className="chat-title-icon">
              <Building2 size={19} />
            </div>

            <div>
              <span>PROPERTY ENQUIRY</span>

              <h1>Conversation</h1>
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="chat-error">
            {error}
          </div>
        )}

        {/* CHAT */}

        <div className="chat-box">
          {loading ? (
            <div className="chat-state">
              <div className="chat-loader" />
              <p>Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-state">
              <div className="empty-chat-icon">
                <User size={28} />
              </div>

              <h3>No messages yet</h3>

              <p>
                Start the conversation with the other
                party.
              </p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((chatMessage) => {
                const senderId = Number(
                  chatMessage.sender_id
                );

                const isMine =
                  currentUserId !== null &&
                  !Number.isNaN(currentUserId) &&
                  senderId === currentUserId;

                return (
                  <div
                    key={chatMessage.id}
                    className={`message-row ${
                      isMine ? "mine" : "theirs"
                    }`}
                  >
                    <div className="message-bubble">
                      {!isMine && (
                        <div className="message-sender">
                          {chatMessage.sender_name ||
                            chatMessage.sender_role ||
                            "User"}
                        </div>
                      )}

                      <div className="message-text">
                        {chatMessage.message}
                      </div>

                      <div className="message-time">
                        {formatTime(
                          chatMessage.created_at
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MESSAGE FORM */}

        <form
          className="chat-input-area"
          onSubmit={sendMessage}
        >
          <input
            type="text"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Type your message..."
            disabled={sending}
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={
              sending || !message.trim()
            }
            title="Send message"
          >
            <Send size={18} />

            <span>
              {sending ? "Sending..." : "Send"}
            </span>
          </button>
        </form>

      </div>
    </div>
  );
}

export default EnquiryChat;