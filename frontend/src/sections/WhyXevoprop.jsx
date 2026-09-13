import { motion } from "framer-motion";
import {
  ShieldCheck,
  MessageCircle,
  Sparkles,
  GitCompare,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./WhyXevoprop.css";

const benefits = [
  {
    icon: ShieldCheck,
    number: "01",
    title: "Verified Properties",
    description:
      "Discover property listings with greater confidence through verified information and transparent details.",
  },
  {
    icon: MessageCircle,
    number: "02",
    title: "Direct Connections",
    description:
      "Connect with sellers, developers and property stakeholders without unnecessary layers in between.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Intelligent Discovery",
    description:
      "Find relevant properties faster with smarter discovery based on your preferences and requirements.",
  },
  {
    icon: GitCompare,
    number: "04",
    title: "Confident Decisions",
    description:
      "Understand, compare and evaluate properties before taking the next step.",
  },
];

function WhyXevoprop() {
  const navigate = useNavigate();

  return (
    <section className="why-section" id="about">
      <div className="why-container">

        {/* HEADER */}
        <motion.div
          className="why-header"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="why-label">
              WHY XEVOPROP
            </span>

            <h2>
              Property decisions
              <br />
              <span>made simpler.</span>
            </h2>
          </div>

          <p>
            Xevoprop brings discovery, connection and
            decision-making together in one connected
            property experience.
          </p>
        </motion.div>

        {/* BENEFITS */}
        <div className="why-grid">

          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <motion.div
                className="why-card"
                key={benefit.number}
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
                  delay: index * 0.1,
                }}
              >
                <div className="why-card-top">
                  <span>{benefit.number}</span>

                  <div className="why-icon">
                    <Icon size={21} />
                  </div>
                </div>

                <h3>
                  {benefit.title}
                </h3>

                <p>
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}

        </div>

        {/* CTA */}
        <motion.div
          className="why-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span>
              READY TO EXPLORE?
            </span>

            <strong>
              Find a property that feels right.
            </strong>
          </div>

          <button
            type="button"
            onClick={() => navigate("/properties")}
          >
            Explore properties
            <ArrowUpRight size={17} />
          </button>
        </motion.div>

      </div>
    </section>
  );
}

export default WhyXevoprop;