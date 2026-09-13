import { motion } from "framer-motion";
import {
  Search,
  MessageCircle,
  GitCompare,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover",
    description:
      "Explore relevant properties using intelligent search, meaningful filters and verified information.",
    action: "/properties",
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "Connect",
    description:
      "Connect directly with developers, builders, sellers and relevant property stakeholders.",
    action: "/properties",
  },
  {
    number: "03",
    icon: GitCompare,
    title: "Decide",
    description:
      "Compare opportunities, understand the details and make a decision with greater confidence.",
    action: "/properties",
  },
  {
    number: "04",
    icon: CalendarCheck,
    title: "Book",
    description:
      "Move from property discovery toward visits, enquiries and a seamless booking journey.",
    action: "/properties",
  },
];

function HowItWorks() {
  const navigate = useNavigate();

  return (
    <section className="how-section" id="how-it-works">
      <div className="how-container">

        {/* Header */}
        <motion.div
          className="how-header"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="how-label">
            THE XEVOPROP JOURNEY
          </span>

          <h2>
            From discovery
            <br />
            <span>to decision.</span>
          </h2>

          <p>
            We've simplified the property journey into a
            connected experience designed around you.
          </p>
        </motion.div>

        {/* Journey */}
        <div className="journey">

          {/* Connecting line */}
          <div className="journey-line">
            <div className="journey-progress"></div>
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.button
                type="button"
                className="journey-step"
                key={step.number}
                onClick={() => navigate(step.action)}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                }}
              >
                <div className="step-number">
                  {step.number}
                </div>

                <div className="step-icon">
                  <Icon size={22} />
                </div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>

                {index < steps.length - 1 && (
                  <ArrowRight
                    className="step-arrow"
                    size={18}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Bottom message */}
        <motion.div
          className="journey-message"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span>ONE PLATFORM</span>

          <strong>
            Less searching. More certainty.
          </strong>
        </motion.div>

      </div>
    </section>
  );
}

export default HowItWorks;