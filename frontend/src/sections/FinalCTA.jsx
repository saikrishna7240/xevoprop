import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Search,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./FinalCTA.css";

function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="final-cta-section">
      <div className="final-cta-container">
        {/* LEFT CONTENT */}
        <motion.div
          className="final-cta-content"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="final-cta-label">
            READY TO EXPLORE?
          </span>

          <h2>
            Your next property
            <span> could be one search away.</span>
          </h2>

          <p>
            Explore verified properties and projects on Xevoprop,
            compare your options and connect with the right people.
          </p>

          <div className="final-cta-actions">
            <button
              type="button"
              className="final-cta-primary"
              onClick={() => navigate("/properties")}
            >
              <Search size={16} />
              Explore properties
              <ArrowUpRight size={16} />
            </button>

            <button
              type="button"
              className="final-cta-secondary"
              onClick={() => navigate("/projects")}
            >
              <Building2 size={16} />
              Explore projects
              <ArrowUpRight size={16} />
            </button>
          </div>
        </motion.div>

        {/* RIGHT SUMMARY */}
        <motion.div
          className="final-cta-summary"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className="cta-summary-header">
            <span>WHAT YOU CAN DO</span>
          </div>

          <div className="cta-summary-item">
            <span className="cta-summary-number">01</span>
            <div>
              <strong>Discover</strong>
              <p>Search properties and projects.</p>
            </div>
          </div>

          <div className="cta-summary-item">
            <span className="cta-summary-number">02</span>
            <div>
              <strong>Connect</strong>
              <p>Enquire directly with property professionals.</p>
            </div>
          </div>

          <div className="cta-summary-item">
            <span className="cta-summary-number">03</span>
            <div>
              <strong>Move forward</strong>
              <p>Schedule visits and take the next step.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCTA;