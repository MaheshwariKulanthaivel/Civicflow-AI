/**
 * AI Action Planner:
 * Generates structured, standard operating procedure (SOP) action checklists for each issue.
 * Action statuses: PENDING, IN_PROGRESS, COMPLETED.
 */

const DEFAULT_PLANS = {
  "Sewage overflow": [
    { title: "Inspect overflow site and identify upstream pipeline rupture", sequence: 1 },
    { title: "Deploy suction and de-silting motorized machinery", sequence: 2 },
    { title: "Clear subterranean blockage and flush lateral conduits", sequence: 3 },
    { title: "Seal damaged pipe collar & sanitize immediate perimeter", sequence: 4 },
    { title: "Verify full drainage restoration and hydrologic flow rate", sequence: 5 }
  ],
  "Drainage blockage": [
    { title: "Inspect culvert and stormwater channel inlet", sequence: 1 },
    { title: "Clear solid debris and silt accumulation", sequence: 2 },
    { title: "Restore standard stormwater flow gradient", sequence: 3 },
    { title: "Post-clearance inspection & silt trap verification", sequence: 4 }
  ],
  "Road surface damage": [
    { title: "Survey damaged road perimeter and quantify sub-base erosion", sequence: 1 },
    { title: "Create inter-departmental work order & requisition asphalt mix", sequence: 2 },
    { title: "Schedule site clearance post-sewage drainage completion", sequence: 3 },
    { title: "Excavate deteriorated bitumen layer and lay compacted aggregate", sequence: 4 },
    { title: "Apply dense bituminous macadam & finalize roller compaction", sequence: 5 },
    { title: "Post-repair engineering quality check and lane marking", sequence: 6 }
  ],
  "Road pothole": [
    { title: "Survey pothole dimensions and evaluate foundation depth", sequence: 1 },
    { title: "Apply tack coat and cold/hot bitumen compaction mix", sequence: 2 },
    { title: "Level road surface and conduct compaction density test", sequence: 3 }
  ],
  "Traffic obstruction": [
    { title: "Deploy traffic wardens to establish diversion perimeter", sequence: 1 },
    { title: "Clear stationary hazards and open emergency bypass corridor", sequence: 2 },
    { title: "Coordinate with transit police to resume normal traffic flow", sequence: 3 }
  ],
  "Streetlight failure": [
    { title: "Inspect luminaire power supply and junction control box", sequence: 1 },
    { title: "Repair or replace burned 90W LED fixture and driver", sequence: 2 },
    { title: "Test phase-neutral voltage and automatic timer relay", sequence: 3 },
    { title: "Verify night-time illumination radius and citizen safety audit", sequence: 4 }
  ],
  "Water supply interruption": [
    { title: "Isolate affected transmission line and identify pressure drop", sequence: 1 },
    { title: "Deploy water tankers for emergency neighborhood supply", sequence: 2 },
    { title: "Repair main feeder valve and conduct pressure testing", sequence: 3 },
    { title: "Restore scheduled municipal water pumping", sequence: 4 }
  ],
  "Garbage accumulation": [
    { title: "Deploy compacting garbage collection truck and sanitary workers", sequence: 1 },
    { title: "Clear accumulated municipal solid waste and segregated debris", sequence: 2 },
    { title: "Disinfect ground surface with bleaching powder and lime spray", sequence: 3 },
    { title: "Conduct sanitation supervisor verification", sequence: 4 }
  ]
};

export function generateActionPlan(categoryName, issueTitle) {
  const matched = DEFAULT_PLANS[categoryName] || [
    { title: `Conduct preliminary technical survey for ${issueTitle || categoryName}`, sequence: 1 },
    { title: "Issue municipal work order and assign field technicians", sequence: 2 },
    { title: "Execute site rectification and civil/electrical works", sequence: 3 },
    { title: "Perform statutory quality inspection and site restoration", sequence: 4 }
  ];

  return matched.map((step, idx) => ({
    title: step.title,
    sequence_order: step.sequence || idx + 1,
    status: "PENDING"
  }));
}
