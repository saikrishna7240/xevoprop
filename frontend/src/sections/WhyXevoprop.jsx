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
    title: "Verified properties",
    description:
      "Review property information and listing details with greater confidence.",
  },
  {
    icon: MessageCircle,
    number: "02",
    title: "Direct connections",
    description:
      "Connect directly with sellers, developers and other property professionals.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Smarter discovery",
    description:
      "Narrow your search using preferences such as location, property type and budget.",
  },
  {
    icon: GitCompare,
    number: "04",
    title: "Better decisions",
    description:
      "Compare relevant information before deciding which property to explore further.",
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
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="why-header-content">
            <span className="why-label">WHY XEVOPROP</span>

            <h2>
              Built around the way
              <span> people search for property.</span>
            </h2>
          </div>

          <p>
            Xevoprop brings property discovery, communication and
            decision-making into one connected experience.
          </p>
        </motion.div>

        {/* BENEFITS */}
        <div className="why-grid">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <motion.article
                className="why-card"
                key={benefit.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.07,
                }}
              >
                <div className="why-card-top">
                  <span className="why-number">
                    {benefit.number}
                  </span>

                  <div className="why-icon">
                    <Icon size={19} />
                  </div>
                </div>

                <div className="why-card-content">
                  <h3>{benefit.title}</h3>

                  <p>{benefit.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="why-cta"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="why-cta-content">
            <span>START EXPLORING</span>

            <strong>
              Find properties that match your requirements.
            </strong>
          </div>

          <button
            type="button"
            onClick={() => navigate("/properties")}
          >
            Explore properties
            <ArrowUpRight size={16} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default WhyXevoprop;