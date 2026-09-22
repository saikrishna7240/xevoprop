import { motion } from "framer-motion";
import {
  Search,
  MessageCircle,
  CalendarCheck2,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    label: "SEARCH",
    title: "Find properties that fit.",
    description:
      "Search verified properties using location, property type, budget and other relevant details.",
    icon: Search,
    action: "/properties",
  },
  {
    number: "02",
    label: "CONNECT",
    title: "Connect with the right people.",
    description:
      "Send enquiries and communicate directly with sellers, developers and property professionals.",
    icon: MessageCircle,
    action: "/properties",
  },
  {
    number: "03",
    label: "TAKE ACTION",
    title: "Plan your next step.",
    description:
      "Schedule property visits and move forward with the property that matches your requirements.",
    icon: CalendarCheck2,
    action: "/properties",
  },
];

function HowItWorks() {
  const navigate = useNavigate();

  return (
    <section className="how-section" id="how-it-works">
      <div className="how-container">
        {/* HEADER */}
        <motion.div
          className="how-header"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="how-header-content">
            <span className="how-label">
              HOW XEVOPROP WORKS
            </span>

            <h2>
              A simpler way to
              <span> find your next property.</span>
            </h2>

            <p>
              Search properties, connect with the right people and
              take the next step from one connected platform.
            </p>
          </div>

          <button
            type="button"
            className="how-header-link"
            onClick={() => navigate("/properties")}
          >
            Explore properties
            <ArrowUpRight size={16} />
          </button>
        </motion.div>

        {/* STEPS */}
        <div className="how-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.button
                type="button"
                className="how-step"
                key={step.number}
                onClick={() => navigate(step.action)}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                }}
              >
                {/* STEP HEADER */}
                <div className="how-step-header">
                  <span className="how-step-number">
                    {step.number}
                  </span>

                  <span className="how-step-label">
                    {step.label}
                  </span>

                  <div className="how-step-icon">
                    <Icon size={17} />
                  </div>
                </div>

                {/* CONTENT */}
                <div className="how-step-content">
                  <h3>{step.title}</h3>

                  <p>{step.description}</p>

                  <span className="how-step-link">
                    Explore
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* BOTTOM TRUST STRIP */}
        <motion.div
          className="how-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <div className="how-bottom-item">
            <strong>01</strong>
            <span>Search</span>
          </div>

          <div className="how-bottom-line" />

          <div className="how-bottom-item">
            <strong>02</strong>
            <span>Connect</span>
          </div>

          <div className="how-bottom-line" />

          <div className="how-bottom-item">
            <strong>03</strong>
            <span>Take action</span>
          </div>

          <div className="how-bottom-message">
            One connected property experience.
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorks;