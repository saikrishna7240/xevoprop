import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./FinalCTA.css";

function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="final-cta-section">
      <div className="final-cta-glow"></div>

      <div className="final-cta-container">
        <motion.div
          className="final-cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="final-cta-label">
            <Sparkles size={14} />
            YOUR NEXT MOVE STARTS HERE
          </div>

          <h2>
            Find the place
            <br />
            <span>that feels right.</span>
          </h2>

          <p>
            Explore properties, connect directly with the right people
            and make your next property decision with confidence.
          </p>

          <div className="final-cta-actions">
            <button
              type="button"
              className="final-cta-primary"
              onClick={() => navigate("/properties")}
            >
              <Search size={17} />
              Explore properties
              <ArrowUpRight size={17} />
            </button>

            <button
              type="button"
              className="final-cta-secondary"
              onClick={() => navigate("/projects")}
            >
              Explore projects
              <ArrowUpRight size={17} />
            </button>
          </div>
        </motion.div>

        <motion.div
          className="final-cta-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <span>DISCOVER</span>
          <span>CONNECT</span>
          <span>DECIDE</span>
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCTA;