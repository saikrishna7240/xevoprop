import { motion } from "framer-motion";
import {
  Sparkles,
  MapPin,
  IndianRupee,
  Home,
  ArrowUpRight,
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
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="ai-label">
            <Sparkles size={15} />
            INTELLIGENT DISCOVERY
          </div>

          <h2>
            Stop searching.
            <br />
            <span>Start discovering.</span>
          </h2>

          <p>
            Tell Xevoprop what you are looking for and
            discover properties that better match your
            location, budget and lifestyle.
          </p>

          <div className="intelligent-points">
            <div>
              <Sparkles size={15} />
              Personalized property discovery
            </div>

            <div>
              <MapPin size={15} />
              Location-based recommendations
            </div>

            <div>
              <IndianRupee size={15} />
              Budget-focused property matching
            </div>
          </div>

          <button
            type="button"
            className="discovery-btn"
            onClick={handleDiscovery}
          >
            Start discovering
            <ArrowUpRight size={18} />
          </button>
        </motion.div>

        {/* AI INTERFACE */}
        <motion.div
          className="ai-interface"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >

          {/* HEADER */}
          <div className="ai-interface-header">
            <div className="ai-header-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <strong>Xevoprop AI</strong>
              <span>Intelligent property discovery</span>
            </div>

            <span className="online-dot"></span>
          </div>

          {/* USER QUERY */}
          <div className="user-query">
            <span>Your preferences</span>

            <p>
              Find me a modern apartment in Hyderabad
              within my budget.
            </p>
          </div>

          {/* AI RESPONSE */}
          <div className="ai-response">

            <div className="ai-response-title">
              <Sparkles size={13} />
              Smart Match
            </div>

            <p>
              We found properties that closely match
              your preferences.
            </p>

            {/* PREFERENCE TAGS */}
            <div className="preference-tags">

              <span>
                <MapPin size={10} />
                Hyderabad
              </span>

              <span>
                <Home size={10} />
                Apartment
              </span>

              <span>
                <IndianRupee size={10} />
                ₹50L – ₹1 Cr
              </span>

            </div>

            {/* RESULT */}
            <div className="ai-result">

              <div className="result-image"></div>

              <div className="result-info">
                <span>94% MATCH</span>

                <h4>
                  Premium 2 BHK Apartment
                </h4>

                <p>
                  Hyderabad
                </p>

                <strong>
                  ₹72 Lakh
                </strong>
              </div>

            </div>

            {/* RESULT BUTTON */}
            <button
              type="button"
              className="ai-result-btn"
              onClick={handleExplore}
            >
              Explore matching properties
              <ArrowUpRight size={13} />
            </button>

          </div>

          {/* INPUT */}
          <div className="ai-input">
            <Sparkles size={14} />

            <span>
              Tell us what you're looking for...
            </span>

            <button
              type="button"
              onClick={handleDiscovery}
              aria-label="Start property discovery"
            >
              <ArrowUpRight size={14} />
            </button>
          </div>

        </motion.div>

      </div>
    </section>
  );
}

export default IntelligentDiscovery;