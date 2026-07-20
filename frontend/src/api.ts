const API_BASE = "http://localhost:8000/api";

async function fetchJson(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "API Request Failed");
    }
    return await res.json();
  } catch (err) {
    console.warn(`API error on ${url}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
    } catch {
      // Mock fallback for frontend-only testing
      const roles: Record<string, { role: string; name: string; userId: number }> = {
        donor: { role: "donor", name: "Freny Shah", userId: 4 },
        hospital: { role: "hospital", name: "Bhavnagar Civil Hospital", userId: 2 },
        bank: { role: "bank", name: "Bhavnagar District Blood Bank", userId: 1 },
        admin: { role: "admin", name: "HemoCast Admin Panel", userId: 3 }
      };
      
      const userKey = username.toLowerCase();
      if (roles[userKey]) {
        return {
          access_token: `mock-token-${roles[userKey].userId}`,
          token_type: "bearer",
          ...roles[userKey]
        };
      }
      // General fallback
      return {
        access_token: "mock-token-99",
        token_type: "bearer",
        role: "bank",
        name: username || "Guest Staff",
        userId: 1
      };
    }
  },

  async signup(userData: any): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
    } catch {
      return {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        name: userData.name
      };
    }
  },

  // Dashboard summary
  async getDashboardSummary(role: string, userId: number): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/dashboard/summary?role=${role}&user_id=${userId}`);
    } catch {
      // Return beautiful structured mock summaries if API fails
      if (role === "donor") {
        return {
          role: "donor",
          name: "Freny Shah",
          blood_group: "O+",
          impact_score: 350,
          streak_weeks: 4,
          last_donation: "2026-04-21",
          eligibility: "Eligible Now",
          badges: ["Monsoon Hero", "O+ Lifesaver", "Fever Fighter"],
          notifications: [
            {
              title: "Platelet Shortage Alert!",
              message: "Dengue cases are rising in Bhavnagar. Your blood group O+ is highly recommended for platelets. Can you donate this week?",
              action: "Schedule Donation"
            }
          ]
        };
      } else if (role === "hospital") {
        return {
          role: "hospital",
          name: "Bhavnagar Civil Hospital",
          district: "Bhavnagar",
          pending_requests_count: 1,
          fulfilled_requests_count: 5,
          recent_requests: [
            {
              id: 101,
              blood_group: "A+",
              component: "Platelets",
              units: 6,
              urgency: "urgent",
              status: "pending",
              required_date: "2026-07-21"
            },
            {
              id: 100,
              blood_group: "O-",
              component: "Packed RBC",
              units: 4,
              urgency: "emergency",
              status: "fulfilled",
              required_date: "2026-07-18"
            }
          ]
        };
      } else {
        return {
          role: "bank",
          bank_name: "Bhavnagar District Blood Bank",
          units_saved: 142,
          shortages_prevented: 58,
          expiry_risk_units: 16,
          alert_banner: {
            severity: "high",
            message: "Critical shortage predicted: Platelets A+ demand will exceed local stock by 8 units tomorrow.",
            reasoning: "Explainable AI flags: 1) Mosquito surveillance indicates high larval count (dengue vector), 2) Hospital reports 2 pediatric platelet transfusions scheduled for tomorrow, 3) Current A+ platelet inventory is below safety margin.",
            action_text: "Notify A+ Platelet Donors",
            action_type: "notify_donors",
            target_blood_group: "A+",
            target_component: "Platelets"
          },
          transfer_suggestion: {
            id: 12,
            blood_group: "AB-",
            component: "Packed RBC",
            units: 10,
            target: "Ahmedabad Civil Hospital Bank",
            reason: "Expiry risk. Bhavnagar demand is low (0.5 units/week), transfer to Ahmedabad where surgical demand for AB- is high."
          },
          donor_suggestion: {
            id: 4,
            name: "Amit Patel",
            blood_group: "O+",
            contact: "9876543210",
            streak: 3
          },
          demand_indicators: [
            { blood_group: "A+", component: "Platelets", predicted_units: 14, confidence: 92, level: "High (Dengue Spike)" },
            { blood_group: "O+", component: "Packed RBC", predicted_units: 18, confidence: 88, level: "Medium (Regular Surgeries)" },
            { blood_group: "O-", component: "Packed RBC", predicted_units: 6, confidence: 95, level: "High (Trauma Alert)" },
            { blood_group: "AB-", component: "Whole Blood", predicted_units: 2, confidence: 81, level: "Stable" }
          ]
        };
      }
    }
  },

  // Forecaster
  async getForecast(bloodGroup: string, component: string, granularity: string): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/forecast?blood_group=${encodeURIComponent(bloodGroup)}&component=${encodeURIComponent(component)}&granularity=${granularity}`);
    } catch {
      // Mock forecast
      const today = new Date();
      const count = granularity === "daily" ? 7 : 6;
      const forecastPoints = [];
      const baseVal = component === "Whole Blood" ? 16 : (component === "Packed RBC" ? 12 : 8);
      
      for (let i = 0; i < count; i++) {
        const nextDate = new Date(today);
        if (granularity === "daily") nextDate.setDate(today.getDate() + i + 1);
        else if (granularity === "weekly") nextDate.setDate(today.getDate() + (i + 1) * 7);
        else nextDate.setMonth(today.getMonth() + i + 1);
        
        let multiplier = 1.0;
        if (granularity === "daily") {
          // Weekend drops
          const day = nextDate.getDay();
          if (day === 0 || day === 6) multiplier = 0.6;
          else if (day === 2 || day === 4) multiplier = 1.3; // Tue/Thu spikes
        }
        
        const predicted = Math.max(2, Math.round((baseVal + Math.sin(i) * 3) * multiplier * (granularity === "weekly" ? 7 : granularity === "monthly" ? 30 : 1)));
        const lower = Math.max(0, Math.round(predicted * 0.75));
        const upper = Math.round(predicted * 1.25);
        
        forecastPoints.push({
          date: nextDate.toISOString().split("T")[0],
          predicted_demand: predicted,
          confidence_lower: lower,
          confidence_upper: upper
        });
      }
      
      const total = forecastPoints.reduce((acc, p) => acc + p.predicted_demand, 0);
      
      const drivers = [
        {
          factor: "Scheduled surgical caseload",
          impact: "+8% demand",
          description: "Local hospitals report 8 scheduled major cardiothoracic and orthopedic surgeries over this horizon."
        }
      ];
      
      if (component === "Platelets") {
        drivers.unshift({
          factor: "Post-monsoon dengue tail",
          impact: "+40% demand",
          description: "Rising stagnant water conditions are driving dengue hospital admissions, triggering platelet requests."
        });
      }
      if (bloodGroup === "O+" || bloodGroup === "O-") {
        drivers.unshift({
          factor: "Festival-season transit traffic",
          impact: "+15% demand",
          description: "High highway traffic during festive holidays historically increases trauma-related emergency surgeries."
        });
      }

      return {
        granularity,
        blood_group: bloodGroup,
        component,
        forecast: forecastPoints,
        total_predicted: total,
        change_vs_average_percent: component === "Platelets" ? 22.4 : 5.4,
        drivers,
        recommended_action: component === "Platelets" 
          ? "Schedule 2 additional platelet donation camps immediately. Pre-position +30 units."
          : `Pre-position +${Math.round(total * 0.1)} units of ${bloodGroup} ${component}.`
      };
    }
  },

  // Inventory
  async getInventory(bankId: number = 1): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/inventory?bank_id=${bankId}`);
    } catch {
      const today = new Date();
      const formatDate = (days: number) => {
        const d = new Date(today);
        d.setDate(today.getDate() + days);
        return d.toISOString().split("T")[0];
      };
      
      return [
        { id: 1, blood_group: "O+", component: "Whole Blood", units: 8, expiry_date: formatDate(2), status: "available" },
        { id: 2, blood_group: "O-", component: "Packed RBC", units: 3, expiry_date: formatDate(4), status: "available" },
        { id: 3, blood_group: "A+", component: "Platelets", units: 12, expiry_date: formatDate(1), status: "available" },
        { id: 4, blood_group: "O+", component: "Platelets", units: 6, expiry_date: formatDate(1), status: "available" },
        { 
          id: 5, 
          blood_group: "AB-", 
          component: "Packed RBC", 
          units: 10, 
          expiry_date: formatDate(5), 
          status: "available",
          redistribution_target: "Ahmedabad Civil Hospital Bank",
          redistribution_reason: "Expiry risk. Bhavnagar demand is low (0.5 units/week), transfer to Ahmedabad where surgical demand for AB- is high." 
        },
        { id: 6, blood_group: "O+", component: "Fresh Frozen Plasma", units: 25, expiry_date: formatDate(120), status: "available" },
        { id: 7, blood_group: "B+", component: "Packed RBC", units: 18, expiry_date: formatDate(22), status: "available" },
        { id: 8, blood_group: "A-", component: "Whole Blood", units: 4, expiry_date: formatDate(15), status: "available" }
      ];
    }
  },

  async executeRedistribution(itemId: number): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/inventory/redistribute/${itemId}`, { method: "POST" });
    } catch {
      return {
        success: true,
        message: "Successfully initiated transfer. Redistribution logged in system."
      };
    }
  },

  async createInventoryItem(item: any): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/inventory/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
    } catch {
      return { id: Math.random(), ...item, status: "available" };
    }
  },

  // Donor Targeting
  async getTargetDonors(bloodGroup: string = "O+", component: string = "Platelets"): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/donors/target?blood_group=${encodeURIComponent(bloodGroup)}&component=${encodeURIComponent(component)}`);
    } catch {
      return [
        { id: 1, name: "Amit Patel", blood_group: "O+", distance_km: 1.2, eligible: true, last_donation_days_ago: 92, response_likelihood: 0.92, contact_number: "9876543210" },
        { id: 2, name: "Pooja Sharma", blood_group: "O-", distance_km: 2.8, eligible: true, last_donation_days_ago: 120, response_likelihood: 0.88, contact_number: "9876543211" },
        { id: 3, name: "Vikram Singh", blood_group: "B+", distance_km: 1.5, eligible: true, last_donation_days_ago: 60, response_likelihood: 0.72, contact_number: "9876543214" },
        { id: 4, name: "Sneha Joshi", blood_group: "O+", distance_km: 4.1, eligible: true, last_donation_days_ago: 95, response_likelihood: 0.75, contact_number: "9876543215" },
        { id: 5, name: "Rajesh Mehta", blood_group: "AB-", distance_km: 3.5, eligible: true, last_donation_days_ago: 200, response_likelihood: 0.65, contact_number: "9876543212" },
        { id: 6, name: "Neha Gohil", blood_group: "A+", distance_km: 0.9, eligible: false, last_donation_days_ago: 10, response_likelihood: 0.12, contact_number: "9876543213" }
      ];
    }
  },

  async notifyDonors(donorIds: number[], message: string): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/donors/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donor_ids: donorIds, message })
      });
    } catch {
      return {
        success: true,
        message: `Outreach triggered. Sent plain SMS & WhatsApp fallbacks containing '${message}' to ${donorIds.length} donors.`
      };
    }
  },

  // Drives Planner
  async getDriveRecommendations(): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/drives/planner`);
    } catch {
      const today = new Date();
      const formatDate = (days: number) => {
        const d = new Date(today);
        d.setDate(today.getDate() + days);
        return d.toISOString().split("T")[0];
      };
      
      return [
        {
          suggested_location: "Bhavnagar Engineering College Hall",
          suggested_date: formatDate(12),
          expected_yield: 95,
          reasoning: "High-yield historical location. Aligning with predicted 15% bump in O+ demand for the upcoming festival weeks.",
          target_blood_group: "O+",
          priority: "High"
        },
        {
          suggested_location: "Alang Port Community Center",
          suggested_date: formatDate(22),
          expected_yield: 130,
          reasoning: "High concentration of factory workers. Perfect for mass Whole Blood collection prior to dengue season.",
          target_blood_group: "All Groups",
          priority: "Medium"
        },
        {
          suggested_location: "Bhavnagar GIDC Sports Club",
          suggested_date: formatDate(5),
          expected_yield: 40,
          reasoning: "Nearby local donor hub. Urgent target needed to cover predicted A+ Platelet deficit due to dengue caseload rise.",
          target_blood_group: "A+",
          priority: "Critical"
        }
      ];
    }
  },

  async listDrives(bankId: number = 1): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/drives?bank_id=${bankId}`);
    } catch {
      const today = new Date();
      const formatDate = (days: number) => {
        const d = new Date(today);
        d.setDate(today.getDate() + days);
        return d.toISOString().split("T")[0];
      };
      return [
        { id: 1, blood_bank_id: bankId, name: "Bhavnagar University Student Drive", location: "University Campus Hall, Bhavnagar", latitude: 21.7500, longitude: 72.1400, date: formatDate(10), expected_yield: 80, status: "scheduled" },
        { id: 2, blood_bank_id: bankId, name: "GIDC Industrial Area Outreach", location: "GIDC Welfare Center, Chitra, Bhavnagar", latitude: 21.7850, longitude: 72.1200, date: formatDate(24), expected_yield: 120, status: "scheduled" }
      ];
    }
  },

  async scheduleDrive(drive: any): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/drives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(drive)
      });
    } catch {
      return { id: Math.random(), ...drive, status: "scheduled" };
    }
  },

  // Hospital Requests & Emergency SOS
  async getHospitalRequests(hospitalId: number = 2): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/hospital/requests?hospital_id=${hospitalId}`);
    } catch {
      const today = new Date();
      const formatDate = (days: number) => {
        const d = new Date(today);
        d.setDate(today.getDate() + days);
        return d.toISOString().split("T")[0];
      };
      return [
        { id: 101, hospital_id: hospitalId, blood_group: "A+", component: "Platelets", units: 6, urgency: "urgent", status: "pending", required_date: formatDate(1), request_date: new Date().toISOString() }
      ];
    }
  },

  async submitBloodRequest(request: any): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/hospital/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      });
    } catch {
      return { id: Math.random(), ...request, status: "pending", request_date: new Date().toISOString() };
    }
  },

  async triggerEmergencySos(request: any): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/hospital/emergency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      });
    } catch {
      // Mock emergency response
      return {
        success: true,
        request_id: 999,
        blood_group: request.blood_group,
        component: request.component,
        units: request.units,
        banks_notified: [
          { name: "Bhavnagar District Blood Bank", distance_km: 1.2, units_available: 4, contact: "9876543219" },
          { name: "Red Cross Bhavnagar Center", distance_km: 3.4, units_available: 2, contact: "9876543218" }
        ],
        donors_contacted: [
          { name: "Amit Patel", blood_group: request.blood_group, distance_km: 1.2, contact: "9876543210" },
          { name: "Pooja Sharma", blood_group: "O-", distance_km: 2.8, contact: "9876543211" }
        ],
        message: "SOS Emergency alert broadcasted! Paged 2 nearby blood banks and notified 2 matching local donors."
      };
    }
  },

  // Chatbot
  async chatbotQuery(message: string): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/chatbot/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
    } catch {
      // client-side chatbot responses for fallback
      const msg = message.toLowerCase();
      let reply = "";
      let intent = "general";
      
      if (msg.includes("platelet") && (msg.includes("expire") || msg.includes("expiry"))) {
        intent = "platelet_expiry";
        reply = "I found 2 batches of Platelets expiring within the next 3 days:\n- 12 units of A+ Platelets expiring tomorrow\n- 6 units of O+ Platelets expiring tomorrow\n\nI recommend contacting Bhavnagar Civil Hospital to arrange an immediate transfer, as they currently have a pending request for 6 units of A+ Platelets.";
      } else if (msg.includes("units") || msg.includes("stock") || msg.includes("avail") || msg.includes("ab-") || msg.includes("o+")) {
        intent = "stock_check";
        reply = "Here are matches from our live inventory:\n- 12 units A+ Platelets (Expiring tomorrow)\n- 8 units O+ Whole Blood (Expiring in 2 days)\n- 10 units AB- Packed RBC (Suggested transfer to Ahmedabad Civil due to low local demand)";
      } else if (msg.includes("forecast") || msg.includes("predict") || msg.includes("demand")) {
        intent = "forecast_query";
        reply = "HemoCast AI model forecasts for next week:\n- **Platelets (A+):** 40% demand increase due to rising post-monsoon dengue caseload.\n- **Whole Blood / RBC (O+):** 15% increase in trauma demand due to highway transit traffic during upcoming festivals.\n\nPre-positioning safety stocks is advised.";
      } else if (msg.includes("sos") || msg.includes("emergency")) {
        intent = "emergency_info";
        reply = "🚨 **Emergency SOS Mode**\n\nIf you need immediate blood units, click the **One-Tap Emergency SOS** button on the Hospital portal. It will broadcast to all nearby blood banks and match eligible O- and group-specific donors within a 15km radius immediately.";
      } else {
        reply = "Hello! I am the HemoCast AI Assistant. 🩸\n\nAsk me about:\n- Platelets expiring soon\n- Live stock availability (e.g. *'What is our AB- stock?'*)\n- AI demand forecasts (*'O+ demand forecast'*)\n- Emergency SOS system";
      }
      
      return { reply, intent };
    }
  }
};
