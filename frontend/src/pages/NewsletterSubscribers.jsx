import { useEffect, useState } from "react";
import "./NewsletterSubscribers.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

const NewsletterSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/newsletter/subscribers`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load subscribers."
        );
      }

      setSubscribers(data?.subscribers || []);
    } catch (error) {
      console.error(
        "Load newsletter subscribers error:",
        error
      );

      setError(
        error.message ||
          "Unable to load subscribers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const activeSubscribers = subscribers.filter(
    (subscriber) => subscriber.is_active
  ).length;

  return (
    <div className="newsletter-subscribers-page">
      <div className="newsletter-subscribers-container">

        {/* HEADER */}
        <div className="newsletter-page-header">
          <div>
            <span className="newsletter-eyebrow">
              NEWSLETTER
            </span>

            <h1>Subscribers</h1>

            <p>
              Manage the people who subscribed to
              Xevoprop updates.
            </p>
          </div>

          <button
            type="button"
            className="newsletter-refresh-button"
            onClick={loadSubscribers}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="newsletter-stats">

          <div className="newsletter-stat-card">
            <span>Total Subscribers</span>
            <strong>{subscribers.length}</strong>
          </div>

          <div className="newsletter-stat-card">
            <span>Active Subscribers</span>
            <strong>{activeSubscribers}</strong>
          </div>

          <div className="newsletter-stat-card">
            <span>Inactive Subscribers</span>
            <strong>
              {subscribers.length -
                activeSubscribers}
            </strong>
          </div>

        </div>

        {/* TABLE */}
        <div className="newsletter-subscribers-card">

          <div className="newsletter-table-header">
            <div>
              <h2>Subscriber List</h2>

              <p>
                All newsletter subscriptions
              </p>
            </div>

            <span className="newsletter-count">
              {subscribers.length} subscribers
            </span>
          </div>

          {loading ? (
            <div className="newsletter-state">
              Loading subscribers...
            </div>
          ) : error ? (
            <div className="newsletter-state newsletter-error">
              {error}
            </div>
          ) : subscribers.length === 0 ? (
            <div className="newsletter-state">
              No newsletter subscribers yet.
            </div>
          ) : (
            <div className="newsletter-table-wrapper">
              <table className="newsletter-table">

                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Subscribed</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {subscribers.map(
                    (subscriber) => (
                      <tr key={subscriber.id}>

                        <td>
                          <div className="newsletter-email">
                            {subscriber.email}
                          </div>
                        </td>

                        <td>
                          {subscriber.subscribed_at
                            ? new Date(
                                subscriber.subscribed_at
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </td>

                        <td>
                          <span
                            className={`newsletter-status ${
                              subscriber.is_active
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {subscriber.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default NewsletterSubscribers;