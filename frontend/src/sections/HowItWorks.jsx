import { motion } from "framer-motion";
import {
  Search,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    label: "FIND",
    title: "Discover the right property.",
    description:
      "Explore verified properties using meaningful filters, locations and details that actually matter.",
    icon: Search,
    action: "/properties",
  },
  {
    number: "02",
    label: "CONNECT",
    title: "Meet the right people.",
    description:
      "Connect directly with developers, sellers and property stakeholders without unnecessary friction.",
    icon: MessageCircle,
    action: "/properties",
  },
  {
    number: "03",
    label: "MOVE FORWARD",
    title: "Turn interest into action.",
    description:
      "Send enquiries, schedule visits and move confidently toward your next property decision.",
    icon: ArrowUpRight,
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
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="how-label">
            HOW XEVOPROP WORKS
          </span>

          <h2>
            Property decisions,
            <br />
            <span>made simpler.</span>
          </h2>

          <p>
            From the first search to the next step,
            Xevoprop keeps your property journey
            connected and clear.
          </p>
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
                  duration: 0.55,
                  delay: index * 0.12,
                }}
              >

                {/* STEP TOP */}
                <div className="how-step-top">

                  <span className="how-step-number">
                    {step.number}
                  </span>

                  <span className="how-step-label">
                    {step.label}
                  </span>

                  <span className="how-step-icon">
                    <Icon size={18} />
                  </span>

                </div>

                {/* STEP CONTENT */}
                <div className="how-step-content">

                  <h3>{step.title}</h3>

                  <p>
                    {step.description}
                  </p>

                  <span className="how-step-link">
                    Explore
                    <ArrowUpRight size={15} />
                  </span>

                </div>

              </motion.button>
            );
          })}

        </div>

        {/* BOTTOM STATEMENT */}
        <motion.div
          className="how-bottom"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="how-bottom-line"></div>

          <div className="how-bottom-content">
            <span>
              ONE CONNECTED EXPERIENCE
            </span>

            <strong>
              Less searching. More certainty.
            </strong>
          </div>

          <div className="how-bottom-line"></div>
        </motion.div>

      </div>
    </section>
  );
}

export default HowItWorks;