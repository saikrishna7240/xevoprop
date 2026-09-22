import { motion } from "framer-motion";
import {
  Building2,
  Home,
  Castle,
  LandPlot,
  Store,
  Building,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./PropertyCategories.css";

const categories = [
  {
    title: "Apartments",
    description: "Modern apartments in prime locations",
    icon: Building2,
    type: "apartment",
    count: "2,450+",
  },
  {
    title: "Independent Houses",
    description: "Spaces designed around your lifestyle",
    icon: Home,
    type: "house",
    count: "1,280+",
  },
  {
    title: "Villas",
    description: "Premium homes with privacy and space",
    icon: Castle,
    type: "villa",
    count: "860+",
  },
  {
    title: "Plots",
    description: "Build your future from the ground up",
    icon: LandPlot,
    type: "plot",
    count: "1,620+",
  },
  {
    title: "Commercial",
    description: "Properties built for business",
    icon: Store,
    type: "commercial",
    count: "740+",
  },
  {
    title: "New Projects",
    description: "Discover upcoming developments",
    icon: Building,
    type: "project",
    count: "320+",
  },
];

function PropertyCategories() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    if (category.type === "project") {
      navigate("/projects");
      return;
    }

    navigate(`/properties?type=${category.type}`);
  };

  return (
    <section
      className="categories-section"
      id="explore"
    >
      <div className="categories-container">

        {/* ================================
            SECTION HEADER
        ================================= */}

        <motion.div
          className="categories-heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="categories-heading-content">

            <span className="section-label">
              EXPLORE PROPERTIES
            </span>

            <h2>
              Search by property type
            </h2>

          </div>

          <button
            type="button"
            className="categories-view-all"
            onClick={() => navigate("/properties")}
          >
            View all properties
            <ArrowUpRight size={16} />
          </button>
        </motion.div>

        {/* ================================
            CATEGORY GRID
        ================================= */}

        <div className="categories-grid">

          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <motion.button
                key={category.title}
                type="button"
                className="category-card"
                onClick={() =>
                  handleCategoryClick(category)
                }
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: "-40px",
                }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                }}
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.99,
                }}
              >

                {/* Icon */}

                <div className="category-icon">
                  <Icon size={21} strokeWidth={1.8} />
                </div>

                {/* Content */}

                <div className="category-content">

                  <div className="category-title-row">

                    <h3>
                      {category.title}
                    </h3>

                    <ArrowUpRight
                      className="category-arrow"
                      size={17}
                    />

                  </div>

                  <p>
                    {category.description}
                  </p>

                </div>

                {/* Count */}

                <div className="category-footer">

                  <span className="category-count">
                    {category.count}
                  </span>

                  <span className="category-properties">
                    properties
                  </span>

                </div>

              </motion.button>
            );
          })}

        </div>

      </div>
    </section>
  );
}

export default PropertyCategories;