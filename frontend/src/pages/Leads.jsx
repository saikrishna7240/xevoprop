import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Check,
  ArrowRight,
} from "lucide-react";

import { apiFetch } from "../lib/api";
import "./Leads.css";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const d = await apiFetch("/enquiries/seller");
      setLeads(d.enquiries || []);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const status = async (id, value) => {
    try {
      const d = await apiFetch(`/enquiries/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: value,
        }),
      });

      setLeads((current) =>
        current.map((lead) =>
          lead.id === id
            ? {
                ...lead,
                ...d.enquiry,
              }
            : lead
        )
      );
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="leads-page">

      <div className="leads-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="leads-header">

          <div>
            <span className="leads-eyebrow">
              XEVOPROP LEADS
            </span>

            <h1>
              Buyer enquiries<span>.</span>
            </h1>

            <p>
              Review and manage enquiries received for your
              properties.
            </p>
          </div>

          <div className="leads-total">

            <strong>{leads.length}</strong>

            <span>Total enquiries</span>

          </div>

        </header>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="leads-state">
            <span className="leads-loader" />
            <p>Loading enquiries...</p>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading && leads.length === 0 && (
          <div className="leads-state leads-empty">

            <MessageCircle size={24} />

            <h2>No enquiries yet</h2>

            <p>
              Buyer enquiries for your properties will
              appear here.
            </p>

          </div>
        )}

        {/* =================================================
            LEADS
        ================================================= */}

        {!loading && leads.length > 0 && (
          <section className="leads-section">

            <div className="leads-list-header">

              <span>BUYER</span>
              <span>PROPERTY</span>
              <span>CONTACT</span>
              <span>STATUS</span>
              <span />

            </div>

            <div className="leads-list">

              {leads.map((lead) => (

                <article
                  className="lead-row"
                  key={lead.id}
                >

                  {/* BUYER */}

                  <div className="lead-buyer">

                    <div className="lead-avatar">
                      {lead.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="lead-buyer-info">

                      <strong>
                        {lead.name}
                      </strong>

                      <span>
                        {lead.email}
                      </span>

                    </div>

                  </div>

                  {/* PROPERTY */}

                  <div className="lead-property">

                    <strong>
                      {lead.property_title}
                    </strong>

                    <span>
                      <MapPin size={12} />

                      {lead.property_location}

                      {lead.property_city
                        ? `, ${lead.property_city}`
                        : ""}
                    </span>

                  </div>

                  {/* CONTACT */}

                  <div className="lead-contact">

                    <a
                      href={`mailto:${lead.email}`}
                      title="Email buyer"
                    >
                      <Mail size={14} />
                    </a>

                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        title="Call buyer"
                      >
                        <Phone size={14} />
                      </a>
                    )}

                    <Link
                      to={`/enquiries/${lead.id}/chat`}
                      title="Open chat"
                    >
                      <MessageCircle size={14} />
                    </Link>

                  </div>

                  {/* STATUS */}

                  <div className="lead-status-wrapper">

                    <span
                      className={`lead-status ${lead.status}`}
                    >
                      {lead.status}
                    </span>

                  </div>

                  {/* CHAT */}

                  <Link
                    to={`/enquiries/${lead.id}/chat`}
                    className="lead-open"
                  >
                    View
                    <ArrowRight size={14} />
                  </Link>

                  {/* MESSAGE */}

                  {lead.message && (
                    <div className="lead-message">
                      <span>MESSAGE</span>

                      <p>{lead.message}</p>
                    </div>
                  )}

                  {/* STATUS ACTIONS */}

                  <div className="lead-actions">

                    <button
                      type="button"
                      className={
                        lead.status === "new"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        status(lead.id, "new")
                      }
                    >
                      <Clock size={12} />
                      New
                    </button>

                    <button
                      type="button"
                      className={
                        lead.status === "contacted"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        status(
                          lead.id,
                          "contacted"
                        )
                      }
                    >
                      <Check size={12} />
                      Contacted
                    </button>

                    <button
                      type="button"
                      className={
                        lead.status === "resolved"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        status(
                          lead.id,
                          "resolved"
                        )
                      }
                    >
                      <Check size={12} />
                      Resolved
                    </button>

                  </div>

                </article>

              ))}

            </div>

          </section>
        )}

      </div>

    </div>
  );
}