import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  ImagePlus,
  MessageCircle,
  Plus,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./Developers.css";

function Developers() {
  return (
    <div className="developers-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="developers-header">
        <div className="developers-header-inner">

          <div className="developers-header-copy">

            <span className="developers-label">
              FOR DEVELOPERS
            </span>

            <h1>
              List your projects.
              <br />
              <span>Reach the right buyers.</span>
            </h1>

            <p>
              Create, manage and present your real-estate projects
              on Xevoprop with the information buyers need to make
              their next decision.
            </p>

            <div className="developers-header-actions">

              <Link
                to="/add-project"
                className="developers-primary-button"
              >
                <Plus size={17} />
                Add Project
              </Link>

              <Link
                to="/projects"
                className="developers-secondary-button"
              >
                View Projects
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>

          <div className="developers-header-info">

            <div className="developers-info-row">
              <Building2 size={18} />

              <div>
                <span>PROJECT LISTINGS</span>
                <strong>Manage your developments</strong>
              </div>
            </div>

            <div className="developers-info-row">
              <MessageCircle size={18} />

              <div>
                <span>BUYER ENQUIRIES</span>
                <strong>Keep enquiries organized</strong>
              </div>
            </div>

            <div className="developers-info-row">
              <Eye size={18} />

              <div>
                <span>PROPERTY DISCOVERY</span>
                <strong>Present projects clearly</strong>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================
          PROJECT MANAGEMENT
      ================================================= */}

      <section className="developers-section">

        <div className="developers-section-heading">

          <div>
            <span>PROJECT MANAGEMENT</span>

            <h2>
              Everything you need to
              manage a project listing.
            </h2>
          </div>

          <p>
            Keep your project information structured and
            ready for property seekers.
          </p>

        </div>

        <div className="developers-management-list">

          <div className="developers-management-row">

            <span className="developers-row-number">
              01
            </span>

            <div className="developers-row-icon">
              <Building2 size={18} />
            </div>

            <div className="developers-row-content">
              <strong>Create a project</strong>

              <span>
                Add the project name, location, type, units,
                pricing and description.
              </span>
            </div>

            <ArrowRight size={17} />

          </div>

          <div className="developers-management-row">

            <span className="developers-row-number">
              02
            </span>

            <div className="developers-row-icon">
              <ImagePlus size={18} />
            </div>

            <div className="developers-row-content">
              <strong>Add project media</strong>

              <span>
                Upload project images and videos to give
                buyers a clearer view of the development.
              </span>
            </div>

            <ArrowRight size={17} />

          </div>

          <div className="developers-management-row">

            <span className="developers-row-number">
              03
            </span>

            <div className="developers-row-icon">
              <ClipboardList size={18} />
            </div>

            <div className="developers-row-content">
              <strong>Submit project information</strong>

              <span>
                Provide the required information and submit
                the project for review.
              </span>
            </div>

            <ArrowRight size={17} />

          </div>

          <div className="developers-management-row">

            <span className="developers-row-number">
              04
            </span>

            <div className="developers-row-icon">
              <MessageCircle size={18} />
            </div>

            <div className="developers-row-content">
              <strong>Manage buyer enquiries</strong>

              <span>
                Keep track of people interested in your
                projects through Xevoprop.
              </span>
            </div>

            <ArrowRight size={17} />

          </div>

        </div>

      </section>

      {/* =================================================
          WORKFLOW
      ================================================= */}

      <section className="developers-workflow">

        <div className="developers-workflow-inner">

          <div className="developers-workflow-heading">

            <span>HOW IT WORKS</span>

            <h2>
              From project creation
              to buyer enquiry.
            </h2>

            <p>
              A straightforward process for getting your
              project listed and discovered.
            </p>

          </div>

          <div className="developers-workflow-list">

            <div className="developers-workflow-item">

              <span>01</span>

              <div>
                <strong>Create your project</strong>

                <p>
                  Enter the basic project and location
                  information.
                </p>
              </div>

            </div>

            <div className="developers-workflow-item">

              <span>02</span>

              <div>
                <strong>Add details and media</strong>

                <p>
                  Provide pricing, units, description,
                  images and videos.
                </p>
              </div>

            </div>

            <div className="developers-workflow-item">

              <span>03</span>

              <div>
                <strong>Submit for review</strong>

                <p>
                  Submit the project with the required
                  agreement and information.
                </p>
              </div>

            </div>

            <div className="developers-workflow-item">

              <span>04</span>

              <div>
                <strong>Connect with buyers</strong>

                <p>
                  Manage enquiries from people interested
                  in your project.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          PROJECT CHECKLIST
      ================================================= */}

      <section className="developers-checklist">

        <div className="developers-checklist-heading">

          <span>BEFORE YOU SUBMIT</span>

          <h2>
            Prepare your project information.
          </h2>

        </div>

        <div className="developers-checklist-content">

          <div className="developers-check-item">
            <CheckCircle2 size={17} />

            <span>
              Project name and location
            </span>
          </div>

          <div className="developers-check-item">
            <CheckCircle2 size={17} />

            <span>
              Project type, units and pricing
            </span>
          </div>

          <div className="developers-check-item">
            <CheckCircle2 size={17} />

            <span>
              Project description and media
            </span>
          </div>

          <div className="developers-check-item">
            <CheckCircle2 size={17} />

            <span>
              Required agreement and confirmations
            </span>
          </div>

        </div>

      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="developers-final">

        <div>
          <span>READY TO LIST?</span>

          <h2>
            Start with your next project.
          </h2>

          <p>
            Create a project listing and make it available
            to property seekers on Xevoprop.
          </p>
        </div>

        <Link
          to="/add-project"
          className="developers-final-button"
        >
          Add Your Project
          <ArrowRight size={16} />
        </Link>

      </section>

    </div>
  );
}

export default Developers;