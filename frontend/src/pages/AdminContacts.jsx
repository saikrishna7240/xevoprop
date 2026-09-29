import { useEffect, useState } from "react";
import {
  Mail,
  MessageSquare,
  Clock,
  User,
  Search,
  RefreshCw,
} from "lucide-react";

import { apiFetch } from "../lib/api";

import "./AdminContacts.css";

function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadContacts = async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/admin/contacts");

      setContacts(data.contacts || []);
    } catch (error) {
      console.error(
        "Failed to load contact enquiries:",
        error
      );

      alert(
        error.message ||
          "Failed to load contact enquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const filteredContacts = contacts.filter((contact) => {
    const searchValue = search.toLowerCase();

    return (
      String(contact.name || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(contact.email || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(contact.subject || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(contact.message || "")
        .toLowerCase()
        .includes(searchValue)
    );
  });

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatSubject = (subject) => {
    const subjects = {
      property: "Property Enquiry",
      listing: "List a Property",
      developer: "Developer Partnership",
      support: "Platform Support",
      other: "Other",
    };

    return subjects[subject] || subject || "General Enquiry";
  };

  const updateStatus = async (id, status) => {
  try {
    await apiFetch(`/admin/contacts/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status,
      }),
    });

    setContacts((previous) =>
      previous.map((contact) =>
        contact.id === id
          ? {
              ...contact,
              status,
            }
          : contact
      )
    );
  } catch (error) {
    console.error(
      "Failed to update contact status:",
      error
    );

    alert(
      error.message ||
        "Failed to update contact status."
    );
  }
};

  return (
    <div className="admin-contacts-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-contacts-header">

        <div>
          <span className="admin-contacts-eyebrow">
            CUSTOMER ENQUIRIES
          </span>

          <h1>
            Contact Enquiries
          </h1>

          <p>
            View and manage messages submitted
            through the Xevoprop contact form.
          </p>
        </div>

        <button
          type="button"
          className="admin-contacts-refresh"
          onClick={loadContacts}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "is-spinning" : ""}
          />

          Refresh
        </button>

      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="admin-contacts-summary">

        <div className="admin-contact-stat">

          <div className="admin-contact-stat-icon">
            <MessageSquare size={19} />
          </div>

          <div>
            <span>Total Enquiries</span>
            <strong>{contacts.length}</strong>
          </div>

        </div>

        <div className="admin-contact-stat">

          <div className="admin-contact-stat-icon">
            <Mail size={19} />
          </div>

          <div>
            <span>Showing</span>
            <strong>{filteredContacts.length}</strong>
          </div>

        </div>

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="admin-contacts-toolbar">

        <div className="admin-contacts-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search by name, email, subject or message..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="admin-contacts-content">

        {loading ? (

          <div className="admin-contacts-empty">
            Loading enquiries...
          </div>

        ) : filteredContacts.length === 0 ? (

          <div className="admin-contacts-empty">

            <MessageSquare size={36} />

            <h3>
              No enquiries found
            </h3>

            <p>
              Contact form submissions will
              appear here.
            </p>

          </div>

        ) : (

          <div className="admin-contacts-list">

            {filteredContacts.map((contact) => (

              <article
                className="admin-contact-card"
                key={contact.id}
              >

                {/* CARD HEADER */}

                <div className="admin-contact-card-header">

                  <div className="admin-contact-user">

                    <div className="admin-contact-avatar">
                      <User size={18} />
                    </div>

                    <div>
                      <h3>
                        {contact.name}
                      </h3>

                      <a
                        href={`mailto:${contact.email}`}
                      >
                        {contact.email}
                      </a>
                    </div>

                  </div>

                  <select
  className={`admin-contact-status-select status-${String(
    contact.status || "new"
  ).toLowerCase()}`}
  value={contact.status || "new"}
  onChange={(event) =>
    updateStatus(
      contact.id,
      event.target.value
    )
  }
>
  <option value="new">
    New
  </option>

  <option value="read">
    Read
  </option>

  <option value="resolved">
    Resolved
  </option>
</select>

                </div>

                {/* SUBJECT */}

                <div className="admin-contact-subject">

                  <span>
                    Subject
                  </span>

                  <strong>
                    {formatSubject(contact.subject)}
                  </strong>

                </div>

                {/* MESSAGE */}

                <div className="admin-contact-message">

                  <span>
                    Message
                  </span>

                  <p>
                    {contact.message}
                  </p>

                </div>

                {/* FOOTER */}

                <div className="admin-contact-card-footer">

                  <span>
                    <Clock size={14} />
                    {formatDate(contact.created_at)}
                  </span>

                  <a
                    href={`mailto:${contact.email}?subject=Re: ${formatSubject(
                      contact.subject
                    )}`}
                    className="admin-contact-reply"
                  >
                    <Mail size={15} />
                    Reply
                  </a>

                </div>

              </article>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminContacts;