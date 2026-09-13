import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  ChevronDown,
  Building2,
  Home,
  LandPlot,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

function Hero() {
  const navigate = useNavigate();

  const [searchType, setSearchType] = useState("buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchType) params.set("type", searchType);
    if (location.trim()) params.set("location", location.trim());
    if (propertyType) params.set("propertyType", propertyType);
    if (budget) params.set("budget", budget);

    navigate(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const propertyOptions = [
    { value: "", label: "Any Property" },
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "house", label: "Independent House" },
    { value: "office", label: "Office" },
    { value: "shop", label: "Shop" },
    { value: "plot", label: "Plot" },
  ];

  const budgetOptions = [
    { value: "", label: "Any Budget" },
    { value: "0-2500000", label: "Under ₹25 Lakh" },
    { value: "2500000-5000000", label: "₹25L – ₹50L" },
    { value: "5000000-10000000", label: "₹50L – ₹1 Cr" },
    { value: "10000000-20000000", label: "₹1 Cr – ₹2 Cr" },
    { value: "20000000+", label: "Above ₹2 Cr" },
  ];

  return (
    <section className="hero">

      {/* Background */}
      <div className="hero-grid"></div>
      <div className="hero-glow hero-glow-left"></div>
      <div className="hero-glow hero-glow-right"></div>

      <div className="hero-container">

        {/* Badge */}
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span></span>
          India's smarter property platform
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Discover.
          <br />
          <span>Connect. Decide.</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="hero-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          Discover verified properties, connect directly with
          the right people, and make confident property
          decisions — without unnecessary hassle.
        </motion.p>

        {/* Search */}
        <motion.div
          className="hero-search-wrapper"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >

          {/* Search Type */}
          <div className="search-types">

            <button
              type="button"
              className={`search-type ${
                searchType === "buy" ? "active" : ""
              }`}
              onClick={() => setSearchType("buy")}
            >
              <Home size={16} />
              Buy
            </button>

            

            <button
              type="button"
              className={`search-type ${
                searchType === "commercial" ? "active" : ""
              }`}
              onClick={() => setSearchType("commercial")}
            >
              <Building2 size={16} />
              Commercial
            </button>

            <button
              type="button"
              className={`search-type ${
                searchType === "plot" ? "active" : ""
              }`}
              onClick={() => setSearchType("plot")}
            >
              <LandPlot size={16} />
              Plots
            </button>

          </div>

          {/* Search Fields */}
          <div className="search-main">

            {/* Location */}
            <div className="search-input location-input">

              <MapPin size={20} />

              <div>
                <label>LOCATION</label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search city, locality..."
                />
              </div>

            </div>

            {/* Property Type */}
            <div className="search-input">

              <div>
                <label>PROPERTY TYPE</label>

                <div className="select-wrapper">
                  <select
                    value={propertyType}
                    onChange={(e) =>
                      setPropertyType(e.target.value)
                    }
                  >
                    {propertyOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={16} />
                </div>
              </div>

            </div>

            {/* Budget */}
            <div className="search-input">

              <div>
                <label>BUDGET</label>

                <div className="select-wrapper">
                  <select
                    value={budget}
                    onChange={(e) =>
                      setBudget(e.target.value)
                    }
                  >
                    {budgetOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={16} />
                </div>
              </div>

            </div>

            {/* Search Button */}
            <button
              type="button"
              className="hero-search-button"
              onClick={handleSearch}
            >
              <Search size={20} />
              <span>Search</span>
            </button>

          </div>

        </motion.div>

        {/* Trust */}
        <motion.div
          className="hero-trust"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
        >
          <span>✓ Verified Properties</span>
          <span>✓ Direct Connections</span>
          <span>✓ Zero Brokerage*</span>
        </motion.div>

      </div>

    </section>
  );
}

export default Hero;