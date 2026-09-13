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
    <section className="categories-section" id="explore">
      <div className="categories-container">

        {/* Heading */}
        <motion.div
          className="categories-heading"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="section-label">
              EXPLORE BY PROPERTY
            </span>

            <h2>
              Find the space that
              <span> fits your life.</span>
            </h2>
          </div>

          <p>
            From your first home to your next investment,
            explore properties built around different needs.
          </p>
        </motion.div>

        {/* Categories */}
        <div className="categories-grid">

          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <motion.button
                type="button"
                className="category-card"
                key={category.title}
                onClick={() => handleCategoryClick(category)}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -5,
                }}
              >

                <div className="category-top">

                  <div className="category-icon">
                    <Icon size={22} />
                  </div>

                  <ArrowUpRight
                    className="category-arrow"
                    size={19}
                  />

                </div>

                <div className="category-content">

                  <h3>
                    {category.title}
                  </h3>

                  <p>
                    {category.description}
                  </p>

                </div>

                <span className="category-count">
                  {category.count} properties
                </span>

                <div className="category-line"></div>

              </motion.button>
            );
          })}

        </div>

      </div>
    </section>
  );
}

export default PropertyCategories;