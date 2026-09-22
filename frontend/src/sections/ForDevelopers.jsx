import { motion } from "framer-motion";
import {
  Building2,
  BarChart3,
  Users,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ForDevelopers.css";

const features = [
  {
    icon: Building2,
    number: "01",
    title: "Showcase projects",
    description:
      "Present residential and commercial projects with structured information, pricing and location details.",
  },
  {
    icon: Users,
    number: "02",
    title: "Reach active buyers",
    description:
      "Connect with people actively exploring properties and projects on Xevoprop.",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Manage leads",
    description:
      "Keep track of enquiries, buyer interest and scheduled visits from one place.",
  },
];

function ForDevelopers() {
  const navigate = useNavigate();

  return (
    <section className="developers-section" id="developers">
      <div className="developers-container">
        {/* LEFT CONTENT */}
        <motion.div
          className="developers-content"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="developers-label">
            FOR DEVELOPERS
          </span>

          <h2>
            Everything you need to
            <span> showcase and manage projects.</span>
          </h2>

          <p className="developers-description">
            Xevoprop helps developers present their projects,
            connect with potential buyers and manage property
            enquiries through one connected platform.
          </p>

          <div className="developers-checks">
            <div>
              <CheckCircle2 size={15} />
              Project visibility
            </div>

            <div>
              <CheckCircle2 size={15} />
              Direct buyer enquiries
            </div>

            <div>
              <CheckCircle2 size={15} />
              Lead and visit management
            </div>
          </div>

          <button
            type="button"
            className="developers-btn"
            onClick={() => navigate("/projects")}
          >
            Explore developer projects
            <ArrowUpRight size={16} />
          </button>
        </motion.div>

        {/* RIGHT FEATURES */}
        <div className="developers-features">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.button
                type="button"
                className="developer-feature"
                key={feature.title}
                onClick={() => navigate("/projects")}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                }}
              >
                <div className="developer-feature-number">
                  {feature.number}
                </div>

                <div className="developer-feature-icon">
                  <Icon size={19} />
                </div>

                <div className="developer-feature-content">
                  <h3>{feature.title}</h3>

                  <p>{feature.description}</p>
                </div>

                <ArrowUpRight
                  className="developer-feature-arrow"
                  size={17}
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ForDevelopers;