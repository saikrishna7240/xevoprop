import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  ChevronDown,
  ShieldCheck,
  Building2,
  Home,
} from "lucide-react";
import "./Hero.css";

const Hero = () => {
  const navigate = useNavigate();

  const [searchType, setSearchType] = useState("buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchType) params.append("type", searchType);
    if (location.trim()) params.append("location", location.trim());
    if (propertyType) params.append("propertyType", propertyType);
    if (budget) params.append("budget", budget);

    navigate(`/search?${params.toString()}`);
  };

  const handleLocationKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="hero">
      <div className="hero-container">

        {/* LEFT CONTENT */}
        <div className="hero-content">

          <div className="hero-eyebrow">
            <ShieldCheck size={15} />
            <span>Trusted property discovery</span>
          </div>

          <h1>
            Find a property
            <span> that feels right.</span>
          </h1>

          <p className="hero-description">
            Discover verified properties, residential projects and
            commercial spaces in locations that matter to you.
          </p>

          {/* SEARCH PANEL */}
          <div className="hero-search">

            <div className="hero-search-tabs">
              <button
                type="button"
                className={searchType === "buy" ? "active" : ""}
                onClick={() => setSearchType("buy")}
              >
                <Home size={16} />
                Buy
              </button>

              <button
                type="button"
                className={searchType === "rent" ? "active" : ""}
                onClick={() => setSearchType("rent")}
              >
                Rent
              </button>

              <button
                type="button"
                className={searchType === "commercial" ? "active" : ""}
                onClick={() => setSearchType("commercial")}
              >
                <Building2 size={16} />
                Commercial
              </button>
            </div>

            <div className="hero-search-fields">

              {/* LOCATION */}
              <div className="hero-field hero-location-field">
                <MapPin size={18} />

                <div className="hero-field-content">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="City, locality or area"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={handleLocationKeyDown}
                  />
                </div>
              </div>

              {/* PROPERTY TYPE */}
              <div className="hero-field">
                <div className="hero-field-content">
                  <label>Property type</label>

                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="">Any property</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="house">Independent House</option>
                    <option value="office">Office</option>
                    <option value="shop">Shop</option>
                    <option value="plot">Plot</option>
                  </select>
                </div>

                <ChevronDown size={16} />
              </div>

              {/* BUDGET */}
              <div className="hero-field">
                <div className="hero-field-content">
                  <label>Budget</label>

                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  >
                    <option value="">Any budget</option>
                    <option value="0-2500000">Under ₹25 Lakh</option>
                    <option value="2500000-5000000">
                      ₹25 Lakh – ₹50 Lakh
                    </option>
                    <option value="5000000-10000000">
                      ₹50 Lakh – ₹1 Cr
                    </option>
                    <option value="10000000-20000000">
                      ₹1 Cr – ₹2 Cr
                    </option>
                    <option value="20000000+">₹2 Cr+</option>
                  </select>
                </div>

                <ChevronDown size={16} />
              </div>

              <button
                type="button"
                className="hero-search-button"
                onClick={handleSearch}
                aria-label="Search properties"
              >
                <Search size={19} />
                <span>Search</span>
              </button>

            </div>
          </div>

          {/* TRUST POINTS */}
          <div className="hero-trust">

            <div className="hero-trust-item">
              <ShieldCheck size={17} />
              <span>Verified listings</span>
            </div>

            <div className="hero-trust-divider"></div>

            <div className="hero-trust-item">
              <Building2 size={17} />
              <span>Projects & properties</span>
            </div>

            <div className="hero-trust-divider"></div>

            <div className="hero-trust-item">
              <Home size={17} />
              <span>Direct enquiries</span>
            </div>

          </div>
        </div>

        {/* RIGHT PROPERTY VISUAL */}
        

      </div>
    </section>
  );
};

export default Hero;