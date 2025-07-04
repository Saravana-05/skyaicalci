import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './index.css';

interface ComponentDetails {
  description: string;
  value: number;
}

interface ComplexityLevels {
  Simple: ComponentDetails;
  Medium: ComponentDetails;
  Complex: ComponentDetails;
}

interface UIDefinitions {
  [key: string]: ComplexityLevels;
}

const definitions: UIDefinitions = {
  "Scheduler / Spooler to Start the Process": {
    Simple: { description: "Basic scheduling with minimal dependencies or email spooling", value: 12 },
    Medium: { description: "Moderate scheduling with some dependencies or PDF spooler", value: 18 },
    Complex: { description: "Advanced scheduling with multiple dependencies or task automation", value: 25 },
  },
  "Sub Process or Parallel Tasks": {
    Simple: { description: "One simple sub-processes", value: 35 },
    Medium: { description: "Two nested subprocess", value: 50 },
    Complex: { description: "Three or more nested subprocess", value: 75 }
  },
  "Forms": {
    Simple: { description: "< 7 Fields without any tables and no reference fields", value: 1 },
    Medium: { description: "< 15 Fields, having one table with a max of 2 data reference", value: 3 },
    Complex: { description: "< 25 Fields having many references and table. Few codeblocks.", value: 8 }
  },
  "Master Data Ref": {
    Simple: { description: "Without any mapping to other master data", value: 3 },
    Medium: { description: "With fewer than 6 mappings to other master data", value: 5 },
    Complex: { description: "Mapped to more than 6 other master data entries", value: 8 }
  },
  "Code / Seq Num Generation": {
    Simple: { description: "Simple 1 sequential number generation", value: 5 },
    Medium: { description: "1 sequence generation with one or two mappings to data", value: 8 },
    Complex: { description: "One sequence generation with three or more mappings to data", value: 10 }
  },
  "API Integrations": {
    Simple: { description: "Integrated via GET or POST APIs with one external platform", value: 8 },
    Medium: { description: "Integrated with one outsourced platform using GET and POST API", value: 12 },
    Complex: { description: "Integrated with multiple outsourced platforms", value: 18 }
  },
  "Generation BOTs": {
    Simple: { description: "Simple bot with basic functionality", value: 8 },
    Medium: { description: "Invoice or PO generator Bot, QR Generator bot", value: 12 },
    Complex: { description: "Advanced Document builder bot ( Fully customizable)", value: 25 }
  },
  "Extraction BOTs": {
    Simple: { description: "PDF to text Extractor", value: 10 },
    Medium: { description: "GD Extrction or excel to jason extraction", value: 12 },
    Complex: { description: "Invoice,PO and other image Extraction", value: 18 }
  },
  "Feeds Upstream / File Feed Integration": {
    Simple: { description: "Integration of up to 10 fields from outsourced platforms, with the data maintained in the master database", value: 15 },
    Medium: { description: "Integration of more than 10 fields from outsourced platforms, with the data maintained in the master database", value: 22 },
    Complex: { description: "Integrating fields from outsourced platforms and maintaining them internally with daily refreshes or daily comparisons", value: 30 }
  },
  "Decisions": {
    Simple: { description: "Approvals using decision gateways ", value: 5 },
    Medium: { description: "Calculations based decision gateways", value: 8 },
    Complex: { description: "Triggering other processes via decision gateways", value: 10 }
  },
  "SLA Clocks": {
    Simple: { description: "Simple SLA tracking", value: 12 },
    Medium: { description: "Moderate SLA tracking with some complexity", value: 25 },
    Complex: { description: "Complex SLA tracking with multiple conditions", value: 35 }
  },
  "Rule Sets or Code Block or Module Conditions": {
    Simple: { description: "Field with only core data mapping conditions", value: 5 },
    Medium: { description: "A field that includes mapping conditions for both core data and additional data sources.", value: 8 },
    Complex: { description: "Applying conditions via APIs in coordination with other processes.", value: 12 }
  },
  "Number of Mail Notifications": {
    Simple: { description: "Notifying through email", value: 5 },
    Medium: { description: "Approval Decision through email", value: 12 },
    Complex: { description: "Forms or images through Email", value: 20 }
  },
  "Web RPA - Steps": {
    Simple: { description: "3-5 actions - without login/authentication and  file handling, limited execution with data fetch", value: 4 },
    Medium: { description: "5-15 actions - with login/authentication and  file handling, in a dynamic pages with error handling retry logics", value: 8 },
    Complex: { description: "Cross domain interactions in a dynamic pages with with complex wait conditions, error handling and reporting", value: 14 }
  },
  "Desktop RPA - Steps": {
    Simple: { description: "1-5 simple desktop automation steps", value: 20 },
    Medium: { description: "6-10 moderate desktop automation steps", value: 35 },
    Complex: { description: "11+ complex desktop automation steps", value: 50 }
  },
  "Dashboard, Reports and Analytics": {
    Simple: { description: "1-5 simple dashboard/reporting steps", value: 20 },
    Medium: { description: "6-10 moderate dashboard/reporting steps", value: 35 },
    Complex: { description: "11+ complex dashboard/reporting steps", value: 50 }
  },
  "User Groups": {
    Simple: { description: "1-5 simple user group steps", value: 20 },
    Medium: { description: "6-10 moderate user group steps", value: 35 },
    Complex: { description: "11+ complex user group steps", value: 50 }
  },
  "DMS": {
    Simple: { description: "1-5 simple DMS steps", value: 20 },
    Medium: { description: "6-10 moderate DMS steps", value: 35 },
    Complex: { description: "11+ complex DMS steps", value: 50 }
  }
};


const SkyaicodeCalculator: React.FC = () => {
   const [values, setValues] = useState<Record<string, { Simple: number; Medium: number; Complex: number }>>(() => {
    const initial: any = {};
    Object.keys(definitions).forEach(key => {
      initial[key] = { Simple: 0, Medium: 0, Complex: 0 };
    });
    return initial;
  });

  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTooltip, setMobileTooltip] = useState<{ x: number; y: number; content: JSX.Element } | null>(null);
  const [projectName, setProjectName] = useState('');
  const [showProjectNameInput, setShowProjectNameInput] = useState(false);

  // Check if mobile on mount
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (component: string, level: keyof ComplexityLevels, val: number) => {
    setValues(prev => ({
      ...prev,
      [component]: { ...prev[component], [level]: val },
    }));
  };

  const handleProjectNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowProjectNameInput(false);
    generatePDF();
  };

  const handleRowHover = (component: string, event: React.MouseEvent) => {
    if (isMobile) {
      // Mobile behavior - show tooltip at cursor position
      setMobileTooltip({
        x: event.clientX,
        y: event.clientY,
        content: (
          <div className="mobile-tooltip-content">
            <div className="tooltip-header">{component}</div>
            <div className="tooltip-section">
              <strong>Simple ({definitions[component].Simple.value} pts):</strong>
              <p>{definitions[component].Simple.description}</p>
            </div>
            <div className="tooltip-section">
              <strong>Medium ({definitions[component].Medium.value} pts):</strong>
              <p>{definitions[component].Medium.description}</p>
            </div>
            <div className="tooltip-section">
              <strong>Complex ({definitions[component].Complex.value} pts):</strong>
              <p>{definitions[component].Complex.description}</p>
            </div>
          </div>
        )
      });
    } else {
      // Desktop behavior - show side panel
      setHoveredComponent(component);
    }
  };

  const handleRowLeave = () => {
    if (isMobile) {
      setMobileTooltip(null);
    } else {
      setHoveredComponent(null);
    }
  };

  const totalScore = Object.entries(values).reduce((sum, [key, levels]) => {
    return (
      sum +
      levels.Simple * definitions[key].Simple.value +
      levels.Medium * definitions[key].Medium.value +
      levels.Complex * definitions[key].Complex.value
    );
  }, 0);

  const getProjectType = (score: number) => {
    if (score <= 90) return { type: 'Simple', weeks: '6 Weeks', className: 'simple', description: 'Straightforward implementation with minimal complexity factors' };
    if (score <= 200) return { type: 'Medium', weeks: '8 Weeks', className: 'medium', description: 'Moderate complexity with several components requiring attention' };
    if (score <= 350) return { type: 'High', weeks: '12 Weeks', className: 'high', description: 'Complex implementation with multiple challenging components' };
    return { type: 'Very High', weeks: 'Depends on the Score', className: 'very-high', description: 'Highly complex project requiring detailed planning and possible phased approach' };
  };

  const projectType = getProjectType(totalScore);

  const breakdown = {
    simple: Object.values(values).reduce((sum, v) => sum + v.Simple, 0),
    medium: Object.values(values).reduce((sum, v) => sum + v.Medium, 0),
    complex: Object.values(values).reduce((sum, v) => sum + v.Complex, 0),
  };

  const keyDrivers = Object.entries(values)
    .map(([key, level]) => {
      const score =
        level.Simple * definitions[key].Simple.value +
        level.Medium * definitions[key].Medium.value +
        level.Complex * definitions[key].Complex.value;
      return { name: key, score };
    })
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

const generatePDF = () => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeStr = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const checkAndAddPage = (y: number, buffer = 20) => {
    if (y + buffer > pageHeight) {
      doc.addPage();
      return 20;
    }
    return y;
  };

  // Header
  doc.setFontSize(18);
  doc.setFont('Work Sans', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text('Skyaicode Calculator', pageWidth / 2, 20, { align: 'center' });

  // Project Name
  doc.setFontSize(14);
  doc.setFont('Work Sans', 'bold');
  doc.setTextColor(13, 110, 253);
  doc.text(`Project: ${projectName}`, pageWidth / 2, 30, { align: 'center' });

  // Date and Time
  doc.setFontSize(10);
  doc.setFont('Work Sans', 'normal');
  doc.setTextColor(108, 117, 125);
  doc.text(`Generated on: ${dateStr} at ${timeStr}`, pageWidth / 2, 38, { align: 'center' });

  // Project Overview Section
  doc.setFontSize(16);
  doc.setFont('Work Sans', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text('Project Overview', 10, 45);

  const cardY = 52;
  const cardHeight = 25;
  const cardWidth = 60;

  // Total Score Card
  doc.setFillColor(240, 248, 255);
  doc.rect(10, cardY, cardWidth, cardHeight, 'F');
  doc.setFontSize(12);
  doc.setFont('Work Sans', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text('Total Score', 15, cardY + 8);
  doc.setFontSize(20);
  doc.setTextColor(13, 110, 253);
  doc.text(`${totalScore}`, 15, cardY + 16);
  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  doc.text('Complexity Points', 15, cardY + 21);

  // Project Type Card
  doc.setFillColor(255, 243, 205);
  doc.rect(75, cardY, cardWidth, cardHeight, 'F');
  doc.setFontSize(12);
  doc.setFont('Work Sans', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text('Project Type', 80, cardY + 8);
  doc.setFontSize(16);
  doc.setTextColor(255, 102, 0);
  doc.text(`${projectType.type}`, 80, cardY + 16);
  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  doc.text('Complexity Level', 80, cardY + 21);

  // Timeline Card
  doc.setFillColor(248, 249, 250);
  doc.rect(140, cardY, cardWidth, cardHeight, 'F');
  doc.setFontSize(12);
  doc.setFont('Work Sans', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text('Timeline', 145, cardY + 8);
  doc.setFontSize(16);
  doc.setTextColor(111, 66, 193);
  doc.text(`${projectType.weeks}`, 145, cardY + 16);
  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  doc.text('Estimated Duration', 145, cardY + 21);

  // Complexity Assessment
  let sectionY = checkAndAddPage(95);
  doc.setFontSize(16);
  doc.setFont('Work Sans', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text('Complexity Assessment', 10, sectionY);

  sectionY = checkAndAddPage(sectionY + 8);
  doc.setFontSize(10);
  doc.setFont('Work Sans', 'normal');
  doc.setTextColor(108, 117, 125);
  doc.text(`${projectType.type} Complexity - ${projectType.description}`, 10, sectionY);

  // Component Breakdown
  sectionY = checkAndAddPage(sectionY + 15);
  doc.setFontSize(16);
  doc.setFont('Work Sans', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text('Component Breakdown', 10, sectionY);

  sectionY += 7;
  doc.setFillColor(248, 249, 250);
  doc.rect(10, sectionY, 190, 8, 'F');
  doc.setFontSize(10);
  doc.setFont('Work Sans', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text('Simple', 30, sectionY + 5);
  doc.text('Medium', 95, sectionY + 5);
  doc.text('Complex', 160, sectionY + 5);

  sectionY += 10;
  doc.setFont('Work Sans', 'normal');
  doc.setTextColor(108, 117, 125);
  doc.text(`${breakdown.simple} components`, 30, sectionY);
  doc.text(`${breakdown.medium} components`, 95, sectionY);
  doc.text(`${breakdown.complex} components`, 160, sectionY);

  // Detailed Component Data
  sectionY = checkAndAddPage(sectionY + 15);
  doc.setFontSize(16);
  doc.setFont('Work Sans', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text('Detailed Component Data', 10, sectionY);

  sectionY += 7;
  const componentsWithValues = Object.entries(values).filter(([, levels]) =>
    levels.Simple > 0 || levels.Medium > 0 || levels.Complex > 0
  );

  if (componentsWithValues.length > 0) {
    sectionY = checkAndAddPage(sectionY);
    doc.setFillColor(248, 249, 250);
    doc.rect(10, sectionY, 190, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('Work Sans', 'bold');
    doc.setTextColor(33, 37, 41);
    doc.text('Component', 12, sectionY + 5);
    doc.text('Simple', 130, sectionY + 5);
    doc.text('Medium', 155, sectionY + 5);
    doc.text('Complex', 180, sectionY + 5);
    doc.setDrawColor(222, 226, 230);
    doc.setLineWidth(0.1);
    doc.rect(10, sectionY, 190, 8);

    sectionY += 10;
    doc.setFont('Work Sans', 'normal');
    doc.setFontSize(8);

    componentsWithValues.forEach(([key, levels], index) => {
      sectionY = checkAndAddPage(sectionY, 10);
      doc.setFillColor(index % 2 === 0 ? 255 : 248, 249, 250);
      doc.rect(10, sectionY - 4, 190, 8, 'F');

      const truncatedKey = key.length > 30 ? key.substring(0, 30) + '...' : key;
      doc.setTextColor(33, 37, 41);
      doc.text(truncatedKey, 12, sectionY);
      doc.setTextColor(108, 117, 125);
      doc.text(`${levels.Simple}`, 135, sectionY);
      doc.text(`${levels.Medium}`, 160, sectionY);
      doc.text(`${levels.Complex}`, 185, sectionY);
      doc.setDrawColor(222, 226, 230);
      doc.rect(10, sectionY - 4, 190, 8);

      sectionY += 8;
    });
  }

  // Key Complexity Drivers
  if (keyDrivers.length > 0) {
    sectionY = checkAndAddPage(sectionY + 15);
    doc.setFontSize(16);
    doc.setFont('Work Sans', 'bold');
    doc.setTextColor(33, 37, 41);
    doc.text('Key Complexity Drivers', 10, sectionY);

    sectionY += 10;
    doc.setFontSize(10);
    doc.setFont('Work Sans', 'normal');
    keyDrivers.forEach((driver, index) => {
      sectionY = checkAndAddPage(sectionY, 8);
      doc.setTextColor(33, 37, 41);
      doc.text(`${index + 1}. ${driver.name}`, 15, sectionY);
      doc.setTextColor(108, 117, 125);
      doc.text(`${driver.score} pts`, 180, sectionY);
      sectionY += 6;
    });
  }

  // Save the PDF
  doc.save(`${projectName || 'Skyaicode_Report'}_${dateStr.replace(/\//g, '-')}.pdf`);
};

  return (
    <div className="calculator-container">
      <style jsx>{`
       .tooltip-panel {
  width: 350px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  position: fixed;
  top: 0px;
  right: 0px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 300px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  z-index: 1000;
}

        .tooltip-panel h3 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          font-size: 1.2rem;
          border-bottom: 2px solid #3498db;
          padding-bottom: 8px;
        }

        .tooltip-panel-content {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .complexity-card {
          background: white;
          border-radius: 8px;
          padding: 15px;
          border-left: 4px solid;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .complexity-card.simple {
          border-left-color: #27ae60;
        }

        .complexity-card.medium {
          border-left-color: #f39c12;
        }

        .complexity-card.complex {
          border-left-color: #e74c3c;
        }

        .complexity-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 8px;
        }

        .complexity-level {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .complexity-points {
          background: #ecf0f1;
          color: #2c3e50;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .complexity-description {
          color: #555;
          line-height: 1.4;
          margin: 0;
        }

        .mobile-tooltip {
          position: fixed;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-width: 300px;
          font-size: 14px;
        }

        .mobile-tooltip-content .tooltip-header {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
        }

        .mobile-tooltip-content .tooltip-section {
          margin-bottom: 10px;
        }

        .mobile-tooltip-content .tooltip-section:last-child {
          margin-bottom: 0;
        }

        .mobile-tooltip-content p {
          margin: 5px 0 0 0;
          color: #555;
          line-height: 1.3;
        }

        .placeholder-text {
          color: #95a5a6;
          font-style: italic;
          text-align: center;
          margin-top: 50px;
        }

        @media (max-width: 768px) {
          .tooltip-panel {
            display: none;
          }
        }
      `}</style>

      <h1 className="calculator-title">Skyaicode Calculator</h1>

        {showProjectNameInput && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: '#fff',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      minWidth: '400px',
      position: 'relative'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Enter Project Name</h2>
      <form onSubmit={handleProjectNameSubmit} style={{ textAlign: 'center' }}>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '80%',
            marginBottom: '20px'
          }}
          required
        />
        <div>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#4291e6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'medium',
              cursor: 'pointer',
              marginRight: '10px',
              fontFamily: 'Work Sans, sans-serif',
            }}
          >
            Generate PDF
          </button>
          <button
            type="button"
            onClick={() => setShowProjectNameInput(false)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ccc',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'medium',
              cursor: 'pointer',
              fontFamily: 'Work Sans, sans-serif'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      <div className="score-summary">
        <div className="score-card">
          <h3>Total Score</h3>
          <div className="score-value-large">{totalScore}</div>
          <div>Based on all complexity factors</div>
        </div>
        <div className="score-card">
          <h3>Project Complexity</h3>
          <div className={`score-value-large ${projectType.className}`}>{projectType.type}</div>
          <div>{projectType.weeks}</div>
        </div>
        <div className="score-card">
          <h3>Estimated Timeline</h3>
          <div className="score-value-large">{projectType.weeks}</div>
          <div>Based on complexity score</div>
        </div>
      </div>

      <div className="main-content">
        <div className="grid-section">
          <div className="grid-container">
            <div className="grid-header">
              <div className="grid-cell header">Category</div>
              <div className="grid-cell">Simple</div>
              <div className="grid-cell">Medium</div>
              <div className="grid-cell">Complex</div>
            </div>
            {Object.entries(definitions).map(([key, val]) => (
              <div 
                className="grid-row" 
                key={key}
                onMouseEnter={(e) => handleRowHover(key, e)}
                onMouseLeave={handleRowLeave}
              >
                <div className="grid-cell first-cell">{key}</div>
                {(['Simple', 'Medium', 'Complex'] as const).map(level => (
                  <div className="grid-cell" key={level}>
                    <input
                      type="number"
                      min={0}
                      value={values[key][level] || ''}
                      onChange={e => handleChange(key, level, parseInt(e.target.value) || 0)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {!isMobile && (
          <div className="tooltip-panel">
            {hoveredComponent ? (
              <>
                <h3>{hoveredComponent}</h3>
                <div className="tooltip-panel-content">
                  <div className="complexity-card simple">
                    <div className="complexity-header">
                      <span className="complexity-level">Simple</span>
                      <span className="complexity-points">{definitions[hoveredComponent].Simple.value} pts</span>
                    </div>
                    <p className="complexity-description">{definitions[hoveredComponent].Simple.description}</p>
                  </div>
                  
                  <div className="complexity-card medium">
                    <div className="complexity-header">
                      <span className="complexity-level">Medium</span>
                      <span className="complexity-points">{definitions[hoveredComponent].Medium.value} pts</span>
                    </div>
                    <p className="complexity-description">{definitions[hoveredComponent].Medium.description}</p>
                  </div>
                  
                  <div className="complexity-card complex">
                    <div className="complexity-header">
                      <span className="complexity-level">Complex</span>
                      <span className="complexity-points">{definitions[hoveredComponent].Complex.value} pts</span>
                    </div>
                    <p className="complexity-description">{definitions[hoveredComponent].Complex.description}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="placeholder-text">
                <p>Hover over a category to see complexity details</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="project-summary">
        <div className="summary-header">
          <h2>Project Summary</h2>
          <button className="export-btn" onClick={() => setShowProjectNameInput(true)}>Export PDF</button>
        </div>
        <div className="summary-item">
          <div className="summary-label">Overall Complexity Assessment:</div>
          <div className="summary-value">
            <span className={`project-type-indicator ${projectType.className}`}>
              {projectType.type}
            </span> - {projectType.description}
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Key Complexity Drivers:</div>
          <div className="summary-value">
            {keyDrivers.length > 0
              ? keyDrivers.map(d => <div key={d.name}>{d.name} ({d.score} pts)</div>)
              : 'No complexity drivers identified yet'}
          </div>
        </div>

        <h3>Complexity Breakdown</h3>
        <div className="complexity-breakdown">
          <div className="complexity-item simple-item">
            <h4>Simple Components</h4>
            <div className="complexity-count">{breakdown.simple}</div>
            <div className="complexity-label">components</div>
          </div>
          <div className="complexity-item medium-item">
            <h4>Medium Components</h4>
            <div className="complexity-count">{breakdown.medium}</div>
            <div className="complexity-label">components</div>
          </div>
          <div className="complexity-item complex-item">
            <h4>Complex Components</h4>
            <div className="complexity-count">{breakdown.complex}</div>
            <div className="complexity-label">components</div>
          </div>
        </div>
      </div>

      {isMobile && mobileTooltip && (
        <div className="mobile-tooltip" style={{ left: mobileTooltip.x, top: mobileTooltip.y }}>
          {mobileTooltip.content}
        </div>
      )}
    </div>
  );
};

export default SkyaicodeCalculator;
