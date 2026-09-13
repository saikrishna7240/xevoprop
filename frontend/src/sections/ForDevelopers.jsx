import { motion } from "framer-motion";
import {
  Building2,
  BarChart3,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ForDevelopers.css";

const features = [
  {
    icon: Building2,
    title: "Showcase Projects",
    description:
      "Present your residential and commercial projects with rich property information.",
  },
  {
    icon: Users,
    title: "Reach Buyers",
    description:
      "Connect directly with people actively searching for properties and projects.",
  },
  {
    icon: BarChart3,
    title: "Manage Leads",
    description:
      "Track enquiries, visits and buyer interest from one connected platform.",
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
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="developers-label">
            FOR DEVELOPERS
          </span>

          <h2>
            Build visibility.
            <br />
            <span>Grow smarter.</span>
          </h2>

          <p>
            Xevoprop gives developers a connected platform
            to showcase projects, reach genuine buyers and
            manage property enquiries more efficiently.
          </p>

          <button
            type="button"
            className="developers-btn"
            onClick={() => navigate("/projects")}
          >
            Explore developer projects
            <ArrowUpRight size={18} />
          </button>
        </motion.div>

        {/* RIGHT FEATURES */}
        <div className="developers-features">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                className="developer-feature"
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
              >
                <div className="developer-feature-icon">
                  <Icon size={21} />
                </div>

                <div>
                  <h3>{feature.title}</h3>

                  <p>{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default ForDevelopers;