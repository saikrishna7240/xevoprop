import { useEffect, useState } from "react";
import {
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom";
import {
  MapPin,
  Search as SearchIcon,
  Home,
  BedDouble,
  IndianRupee,
} from "lucide-react";

import { apiFetch } from "../lib/api";
import "./Search.css";

export default function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  /* =========================
     SEARCH VALUES
  ========================= */

  const [city, setCity] = useState(params.get("city") || "");
  const [type, setType] = useState(params.get("type") || "All");
  const [bedrooms, setBedrooms] = useState(
    params.get("bedrooms") || "All"
  );
  const [maxPrice, setMaxPrice] = useState(
    params.get("maxPrice") || ""
  );

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     SEARCH
  ========================= */

  useEffect(() => {
    const searchProperties = async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams({
          city,
          type,
          bedrooms,
          maxPrice,
        });

        const data = await apiFetch(`/search?${query.toString()}`);

        setResults(data.properties || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchProperties();
  }, [city, type, bedrooms, maxPrice]);

  /* =========================
     HANDLE SEARCH
  ========================= */

  const handleSearch = (e) => {
    e.preventDefault();

    const query = new URLSearchParams();

    if (city.trim()) {
      query.set("city", city.trim());
    }

    if (type !== "All") {
      query.set("type", type);
    }

    if (bedrooms !== "All") {
      query.set("bedrooms", bedrooms);
    }

    if (maxPrice) {
      query.set("maxPrice", maxPrice);
    }

    navigate(`/search?${query.toString()}`);
  };

  return (
    <div className="search-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="search-hero">
        <div className="search-hero-content">

          <span className="search-eyebrow">
            XEVOPROP SEARCH
          </span>

          <h1>
            Find a place
            <br />
            <span>worth living in.</span>
          </h1>

          <p>
            Explore verified properties and discover a home
            that fits your location, lifestyle and budget.
          </p>

        </div>
      </section>

      {/* =================================================
          SEARCH FORM
      ================================================= */}

      <form
        className="search-panel"
        onSubmit={handleSearch}
      >

        <div className="search-fields">

          {/* LOCATION */}

          <div className="search-field">
            <label>
              Location
            </label>

            <div className="search-input-wrapper">
              <MapPin size={17} />

              <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
              />
            </div>
          </div>

          {/* TYPE */}

          <div className="search-field">
            <label>
              Property Type
            </label>

            <div className="search-select-wrapper">
              <Home size={17} />

              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
              >
                <option value="All">
                  All types
                </option>

                <option value="Apartment">
                  Apartment
                </option>

                <option value="Villa">
                  Villa
                </option>

                <option value="House">
                  House
                </option>

                <option value="Plot">
                  Plot
                </option>

                <option value="Commercial">
                  Commercial
                </option>
              </select>
            </div>
          </div>

          {/* BEDROOMS */}

          <div className="search-field">
            <label>
              Bedrooms
            </label>

            <div className="search-select-wrapper">
              <BedDouble size={17} />

              <select
                value={bedrooms}
                onChange={(e) =>
                  setBedrooms(e.target.value)
                }
              >
                <option value="All">
                  Any
                </option>

                <option value="1">
                  1 Bedroom
                </option>

                <option value="2">
                  2 Bedrooms
                </option>

                <option value="3">
                  3 Bedrooms
                </option>

                <option value="4">
                  4 Bedrooms
                </option>

                <option value="5">
                  5+ Bedrooms
                </option>
              </select>
            </div>
          </div>

          {/* BUDGET */}

          <div className="search-field">
            <label>
              Maximum Budget
            </label>

            <div className="search-select-wrapper">
              <IndianRupee size={17} />

              <select
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(e.target.value)
                }
              >
                <option value="">
                  Any budget
                </option>

                <option value="25">
                  ₹25 Lakh
                </option>

                <option value="50">
                  ₹50 Lakh
                </option>

                <option value="75">
                  ₹75 Lakh
                </option>

                <option value="100">
                  ₹1 Crore
                </option>

                <option value="150">
                  ₹1.5 Crore
                </option>

                <option value="200">
                  ₹2 Crore
                </option>

                <option value="300">
                  ₹3 Crore
                </option>
              </select>
            </div>
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            className="search-submit"
          >
            <SearchIcon size={16} />
            Search Properties
          </button>

        </div>

      </form>

      {/* =================================================
          RESULTS
      ================================================= */}

      <section className="search-content">

        <div className="search-toolbar">

          <div className="search-results-count">
            {loading ? (
              "Searching properties..."
            ) : (
              <>
                <strong>
                  {results.length}
                </strong>{" "}
                properties found
              </>
            )}
          </div>

          <Link
            to="/properties"
            className="search-all-properties"
          >
            View all properties
          </Link>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="search-state">
            <div className="search-state-content">
              <div className="search-loading-spinner" />
              <h2>
                Finding your property
              </h2>
              <p>
                Searching our property collection...
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading && results.length === 0 && (
          <div className="search-empty">

            <SearchIcon size={32} />

            <h2>
              No matching properties
            </h2>

            <p>
              Try changing your location, property type,
              bedroom requirement or budget.
            </p>

            <button
              type="button"
              onClick={() => {
                setCity("");
                setType("All");
                setBedrooms("All");
                setMaxPrice("");
              }}
            >
              Clear filters
            </button>

          </div>
        )}

        {/* =================================================
            PROPERTY RESULTS
        ================================================= */}

        {!loading && results.length > 0 && (
          <div className="search-results-grid">

            {results.map((property) => (

              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="search-card"
              >

                <div className="search-card-image">

                  <img
                    src={
                      property.image ||
                      "/xevoprop-logo.jpeg"
                    }
                    alt={
                      property.title ||
                      "Property"
                    }
                  />

                  {property.verified && (
                    <span>
                      ✓ Verified
                    </span>
                  )}

                </div>

                <div className="search-card-content">

                  <strong>
                    {property.price ||
                      "Price on request"}
                  </strong>

                  <h3>
                    {property.title ||
                      "Property"}
                  </h3>

                  <p>
                    <MapPin size={13} />

                    {property.location ||
                      property.city ||
                      "Location unavailable"}

                    {property.city &&
                    property.location
                      ? `, ${property.city}`
                      : ""}
                  </p>

                  <div>

                    <span>
                      {property.bedrooms || 0} Beds
                    </span>

                    <span>
                      {property.bathrooms || 0} Baths
                    </span>

                    <span>
                      {property.area || 0} sq.ft
                    </span>

                  </div>

                </div>

              </Link>

            ))}

          </div>
        )}

      </section>

    </div>
  );
}