import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import "./MarketplaceHero.css";

const MarketplaceHero = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");

  const tabs = [
    "Buy",
    "Projects",
    "Commercial",
  ];

  const propertyTypes = [
    "Apartment",
    "Independent House",
    "Villa",
    "Plot",
    "Commercial Space",
  ];

  const budgets = [
    "Under ₹50 Lakh",
    "₹50 Lakh - ₹1 Cr",
    "₹1 Cr - ₹2 Cr",
    "Above ₹2 Cr",
  ];

  const popularLocations = [
    "Hyderabad",
    "Bengaluru",
    "Mumbai",
    "Pune",
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (activeTab) {
      params.set("type", activeTab.toLowerCase());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    if (propertyType) {
      params.set("propertyType", propertyType);
    }

    if (budget) {
      params.set("budget", budget);
    }

    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="immersive-hero">

      {/* Architectural background */}

      <div className="immersive-hero-image">
        <img
  src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=85"
  alt="Modern residential architecture"
/>

        <div className="immersive-hero-overlay"></div>
      </div>

      {/* Hero content */}

      <div className="immersive-hero-container">

        <div className="immersive-hero-copy">

          <span className="immersive-hero-kicker">
            XEVOPROP
          </span>

          <h1>
            Find a place
            <br />
            <span>worth coming home to.</span>
          </h1>

          <p>
            Discover homes, plots, commercial spaces and
            new projects across India's growing cities.
          </p>

          <div className="immersive-hero-location-links">

            {popularLocations.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setLocation(city)}
              >
                {city}
                <ArrowUpRight size={13} />
              </button>
            ))}

          </div>
        </div>

        {/* Search panel */}

        <div className="immersive-search">

          <div className="immersive-search-tabs">

            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}

          </div>

          <div className="immersive-search-fields">

            {/* Location */}

            <div className="immersive-search-field location">

              <MapPin size={20} />

              <div>
                <span>Where</span>

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="City, locality or landmark"
                />
              </div>

            </div>

            {/* Property type */}

            <label className="immersive-search-field">

              <div>
                <span>Property type</span>

                <select
                  value={propertyType}
                  onChange={(event) =>
                    setPropertyType(event.target.value)
                  }
                >
                  <option value="">
                    Any property
                  </option>

                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <ChevronDown size={15} />

            </label>

            {/* Budget */}

            <label className="immersive-search-field">

              <div>
                <span>Budget</span>

                <select
                  value={budget}
                  onChange={(event) =>
                    setBudget(event.target.value)
                  }
                >
                  <option value="">
                    Any budget
                  </option>

                  {budgets.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <ChevronDown size={15} />

            </label>

            <button
              type="button"
              className="immersive-search-submit"
              onClick={handleSearch}
            >
              <Search size={19} />
              <span>Search</span>
            </button>

          </div>

          <div className="immersive-search-bottom">

            <span>
              Start with a city, neighbourhood or landmark
            </span>

            <button
              type="button"
              onClick={() => navigate("/properties")}
            >
              Browse all properties
              <ArrowUpRight size={14} />
            </button>

          </div>

        </div>

      </div>

      {/* Bottom visual indicator */}

      <div className="immersive-hero-scroll">
        <span>SCROLL TO DISCOVER</span>
        <div></div>
      </div>

    </section>
  );
};

export default MarketplaceHero;