import { motion } from "framer-motion";
import {
  Sparkles,
  MapPin,
  IndianRupee,
  Home,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./IntelligentDiscovery.css";

function IntelligentDiscovery() {
  const navigate = useNavigate();

  const handleDiscovery = () => {
    navigate("/search");
  };

  const handleExplore = () => {
    navigate("/properties");
  };

  return (
    <section className="intelligent-section" id="discovery">
      <div className="intelligent-container">
        {/* LEFT CONTENT */}
        <motion.div
          className="intelligent-content"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="intelligent-label">
            <Sparkles size={14} />
            SMART PROPERTY DISCOVERY
          </div>

          <h2>
            Find properties
            <span> that fit your needs.</span>
          </h2>

          <p className="intelligent-description">
            Share your location, property type and budget. Xevoprop
            helps you narrow down relevant properties without having
            to search through everything manually.
          </p>

          <div className="intelligent-features">
            <div className="intelligent-feature">
              <div className="feature-icon">
                <MapPin size={16} />
              </div>

              <div>
                <strong>Location-based</strong>
                <span>Discover properties in areas you prefer.</span>
              </div>
            </div>

            <div className="intelligent-feature">
              <div className="feature-icon">
                <IndianRupee size={16} />
              </div>

              <div>
                <strong>Budget focused</strong>
                <span>Keep results within your preferred range.</span>
              </div>
            </div>

            <div className="intelligent-feature">
              <div className="feature-icon">
                <Home size={16} />
              </div>

              <div>
                <strong>Property focused</strong>
                <span>Compare the types of properties you need.</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="discovery-btn"
            onClick={handleDiscovery}
          >
            Start discovering
            <ArrowUpRight size={16} />
          </button>
        </motion.div>

        {/* DISCOVERY PANEL */}
        <motion.div
          className="discovery-panel"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          {/* PANEL HEADER */}
          <div className="discovery-panel-header">
            <div className="discovery-panel-title">
              <div className="discovery-panel-icon">
                <Sparkles size={16} />
              </div>

              <div>
                <strong>Property matching</strong>
                <span>Based on your preferences</span>
              </div>
            </div>

            <span className="discovery-status">
              <span />
              Active
            </span>
          </div>

          {/* PREFERENCES */}
          <div className="preference-section">
            <div className="preference-header">
              <span>Your requirements</span>
              <button
                type="button"
                onClick={handleDiscovery}
              >
                Edit
              </button>
            </div>

            <div className="preference-list">
              <div className="preference-item">
                <MapPin size={15} />
                <div>
                  <small>Location</small>
                  <strong>Hyderabad</strong>
                </div>
              </div>

              <div className="preference-item">
                <Home size={15} />
                <div>
                  <small>Property type</small>
                  <strong>Apartment</strong>
                </div>
              </div>

              <div className="preference-item">
                <IndianRupee size={15} />
                <div>
                  <small>Budget</small>
                  <strong>₹50L – ₹1 Cr</strong>
                </div>
              </div>
            </div>
          </div>

          {/* MATCH RESULT */}
          <div className="match-section">
            <div className="match-heading">
              <div>
                <span className="match-label">
                  MATCHING PROPERTY
                </span>

                <h3>Premium 2 BHK Apartment</h3>

                <p>
                  <MapPin size={13} />
                  Hyderabad
                </p>
              </div>

              <div className="match-score">
                <strong>94%</strong>
                <span>Match</span>
              </div>
            </div>

            <div className="match-property">
              <div className="match-property-image">
                <div className="match-image-placeholder">
                  <Home size={26} />
                </div>
              </div>

              <div className="match-property-details">
                <strong>₹72 Lakh</strong>

                <span>2 BHK • Ready to move</span>

                <div className="match-verified">
                  <CheckCircle2 size={13} />
                  Verified property
                </div>
              </div>
            </div>

            <button
              type="button"
              className="match-button"
              onClick={handleExplore}
            >
              Explore matching properties
              <ArrowUpRight size={15} />
            </button>
          </div>

          {/* SEARCH PROMPT */}
          <button
            type="button"
            className="discovery-input"
            onClick={handleDiscovery}
          >
            <Sparkles size={15} />

            <span>
              Tell us what you're looking for...
            </span>

            <ArrowUpRight size={14} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default IntelligentDiscovery;