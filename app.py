import os
import json
import streamlit as st
from google import genai
from google.genai import types

# ---------------------------------------------------------------------------
# SOOTHING UI THEME & SETUP
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="Saathi | Mental Wellness Tracker",
    page_icon="🌸",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for a dark / pastel lavender soothing aesthetic
st.markdown("""
<style>
    /* Styling elements for a comforting wellness space */
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600&family=Quicksand:wght@300;400;500;600;700&display=swap');
    
    html, body, [data-testid="stAppViewContainer"] {
        font-family: 'Quicksand', sans-serif;
        background-color: #12101a;
        color: #e5e0f2;
    }
    
    [data-testid="stHeader"] {
        background-color: rgba(18, 16, 26, 0.8);
    }
    
    [data-testid="stSidebar"] {
        background-color: #1a1726;
        border-right: 1px solid #2d2840;
    }
    
    /* Elegant card design */
    .wellness-card {
        background-color: #1f1a30;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
        border: 1px solid #342c4f;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    
    .card-title {
        font-family: 'Fredoka', sans-serif;
        font-size: 1.4rem;
        color: #bfa6ff;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .quote-box {
        background: linear-gradient(135deg, #281e4c, #1a1533);
        border-left: 4px solid #9f80fc;
        padding: 16px;
        border-radius: 8px;
        font-style: italic;
        margin-bottom: 24px;
        color: #d1c9ef;
    }
    
    /* Custom buttons */
    .stButton>button {
        background: linear-gradient(135deg, #6c46f5, #5031c4);
        color: white !important;
        border-radius: 20px;
        border: none;
        padding: 8px 24px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(108, 70, 245, 0.4);
    }
    
    /* Metrics */
    .score-banner {
        text-align: center;
        padding: 16px;
        border-radius: 100px;
        font-weight: 700;
        font-size: 1.2rem;
        margin: 12px 0;
    }
</style>
""", unsafe_allowed_name=True, unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# GEMINI CLIENT INITIALIZATION
# ---------------------------------------------------------------------------
def get_gemini_client():
    # Attempt to retrieve API Key from st.secrets, then standard environment variable
    api_key = st.secrets.get("GEMINI_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    
    if not api_key:
        api_key = st.sidebar.text_input(
            "🔑 Enter Gemini API Key to activate companion (or set GEMINI_API_KEY in environment):",
            type="password",
            help="Your key is secure. Failsafe mock data will be used if left blank."
        )
    
    if api_key:
        try:
            # Initialize with modern google-genai client structure
            return genai.Client(api_key=api_key)
        except Exception as e:
            st.sidebar.error(f"Initialization failed: {e}")
            return None
    return None

client = get_gemini_client()

# ---------------------------------------------------------------------------
# APP STATE PRESERVATION
# ---------------------------------------------------------------------------
if "chat_history" not in st.session_state:
    st.session_state.chat_history = [
        {"role": "model", "text": "Hi friend. I am **Saathi**, your academic & emotional wellness companion. Exams like JEE/NEET can feel like a heavy mountain to carry. Just know you aren't alone here. Write in your journal or chat with me whenever you need an ear. How are you holding up today? 🌸"}
    ]
if "last_analysis" not in st.session_state:
    st.session_state.last_analysis = None
if "journal_entry" not in st.session_state:
    st.session_state.journal_entry = ""

# ---------------------------------------------------------------------------
# SYSTEM INSTRUCTIONS / EMOTIONAL MATRIX
# ---------------------------------------------------------------------------
SYSTEM_INSTRUCTION = (
    "You are 'Saathi' (companion), an extremely kind, empathetic, and warm voice "
    "designed to offer deep emotional validation and coping strategies to teenagers and "
    "young adults preparing for highly competitive and demanding Indian entrance exams "
    "(most notably JEE Mains, JEE Advanced, and NEET).\n\n"
    "Key Personality Pillars:\n"
    "1. Deeply validation-focused. Start by validating their exhausting workload and high expectations.\n"
    "2. Gently smash perfectionism. Counter the belief that getting selected into IIT, AIIMS, or NIT "
    "is the only indicator of a happy, valuable life.\n"
    "3. Offer quick, actionable, micro-care routines. Guide somatic exercises in-chat (e.g., 'Let's take a deep breath "
    "together right now... in 1, 2, 3.. hold... and exhale').\n"
    "4. Highly positive, comforting, using occasional soft, familiar Hinglish / Indian cultural nuances "
    "gently (e.g., calling them 'beta', 'yaar' or 'friend', saying 'ko baat nahi', 'it's okay to feel overwhelmed') "
    "only if appropriate.\n"
    "5. Do NOT give direct medical psychiatric diagnosis. Encourage professional safety networks if self-harm "
    "is hinted at."
)

# ---------------------------------------------------------------------------
# MAIN LAYOUT
# ---------------------------------------------------------------------------

# Header
st.image("https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=1200", use_container_width=True)

col1, col2 = st.columns([1, 1], gap="large")

with col1:
    st.markdown("<h1 style='font-family: Fredoka, sans-serif; color: #bfa6ff; margin-top: 10px; margin-bottom: 5px;'>🌸 Saathi</h1>", unsafe_allow_html=True)
    st.markdown("<h5 style='color: #a49fc4; margin-bottom: 20px;'>Mental Wellness Companion & Insight Hub for Exam Aspirants</h5>", unsafe_allow_html=True)
    
    st.markdown("""
    <div class="quote-box">
        "Your rank does not measure your worth. The dedication you show to learn, the resilience 
        you build through failures, and the health you protect are what shape your bright future."
    </div>
    """, unsafe_allow_html=True)
    
    # Journaling Form Section
    st.markdown("### 📝 My Quiet Safe Journal")
    st.markdown("<span style='color: #8f8aaa;'>This is a private, non-judgmental space. Write your honest thoughts here—raw frustration, mock test scares, peer worries, or exhaustion. We'll find the hidden patterns together.</span>", unsafe_allow_html=True)
    
    journal_text = st.text_area(
        label="Write here...",
        placeholder="E.g., I couldn't solve the Physics test questions today. I feel like everyone in my batch is miles ahead. My parents expect so much from me, but I feel like my brain has shut down...",
        height=220,
        label_visibility="collapsed"
    )
    
    analyze_btn = st.button("Analyze Journal & Guide Me ✨")
    
    if analyze_btn:
        if not journal_text.strip():
            st.warning("Please pour some of your thoughts in the journal first. Saathi is here to read of them.")
        else:
            st.session_state.journal_entry = journal_text
            if not client:
                # Failsafe mock data if API key is not entered
                st.session_state.last_analysis = {
                    "stressTriggers": ["Mock test questions/scores difficulty", "Perceived peer comparison", "High parental expectations / parental burden"],
                    "selfDoubtPatterns": ["All-or-Nothing thinking / equating rank with complete personal self-worth", "Imposter syndrome compared to classmates"],
                    "burnoutCues": ["Cognitive fatigue ('my brain has shut down')", "Severe emotional overload", "Overwhelming pressure to study endlessly"],
                    "overallStressScore": 82,
                    "stressLevelCategory": "Severe Burnout Alert",
                    "empatheticReflection": "You are dealing with an incredibly heavy burden bacha. Attempting to solve highly competitive physics equations when your mind is already exhausted is bound to cause blocks. It is completely okay to feel stuck—it's a physiological response to stress, not a lack of talent.",
                    "copingPlan": [
                        "🌸 Pause immediately for a 10-minute 'Sight-Ear Sound' walk. Do not touch study folders during this time.",
                        "🌸 Apply the 50-10 Pomodoro strategy to give your mind structured cool-down windows.",
                        "🌸 Change physics/math study goals into micro-successes (e.g. 'Solve 3 questions successfully', not 'Complete the whole module')."
                    ]
                }
                st.sidebar.info("💡 Failsafe wellness analysis shown. Provide your Gemini API key schema in the sidebar to get actual custom student psychological profiling!")
            else:
                with st.spinner("Saathi is gently reading between the lines to protect your energy..."):
                    try:
                        # Call genuine Gemini SDK with Structured Output
                        schema_structure = types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "stressTriggers": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                                "selfDoubtPatterns": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                                "burnoutCues": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                                "overallStressScore": types.Schema(type=types.Type.INTEGER),
                                "stressLevelCategory": types.Schema(type=types.Type.STRING),
                                "empatheticReflection": types.Schema(type=types.Type.STRING),
                                "copingPlan": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING))
                            },
                            required=["stressTriggers", "selfDoubtPatterns", "burnoutCues", "overallStressScore", "stressLevelCategory", "empatheticReflection", "copingPlan"]
                        )
                        
                        prompt_analysis = f"""Analyze the student's entry below. Extract:
                        - Stress Triggers (hidden or active)
                        - Self-Doubt Patterns (unhealthy student mental models)
                        - Physical & somatic burnout cues (signs of extreme exhaustion/brain-lock)
                        - Direct score out of 100 for overall acute stress (0 = fully calm, 100 = extreme panic/near-collapse)
                        - Stress Category
                        - An extremely kind, validating empathetic reflection note
                        - Actionable coping strategies that fit an exam aspirant's daily block routine.

                        Journal Entry:
                        \"\"\"{journal_text}\"\"\"
                        """
                        
                        response = client.models.generate_content(
                            model="gemini-3.5-flash",
                            contents=prompt_analysis,
                            config=types.GenerateContentConfig(
                                system_instruction="You are a professional school counselor and comforting study mentor for adolescent entrance-exam aspirants. Deliver validation, soft encouragement, and somatic wellness advice.",
                                response_mime_type="application/json",
                                response_schema=schema_structure,
                                temperature=0.7
                            )
                        )
                        
                        try:
                            # Parse JSON result safely
                            parsed = json.loads(response.text.strip())
                            st.session_state.last_analysis = parsed
                        except Exception as e:
                            st.error(f"Failed to compile details: {e}")
                            st.session_state.last_analysis = None
                    except Exception as ex:
                        st.error(f"Network error reading journal: {ex}")

    # Output analysis cards if session state holds data
    if st.session_state.last_analysis:
        analysis = st.session_state.last_analysis
        
        # Color coding category
        score = analysis["overallStressScore"]
        color = "#1db954" # green
        if score > 75:
            color = "#f44336" # Red
        elif score > 50:
            color = "#ff9800" # Orange
        else:
            color = "#ffeb3b" # Yellow
            
        st.markdown(f"""
        <div class="wellness-card" style="box-shadow: 0 4px 20px {color}33;">
            <div class="card-title">🌸 Saathi's Compassionate Insights</div>
            <div class="score-banner" style="background-color: {color}22; color: {color}; border: 1px solid {color}55;">
                Level: {analysis["stressLevelCategory"]} ({score}/100)
            </div>
            
            <p style="font-size: 1.05rem; line-height: 1.6; color: #dfdafa; background-color: #29223e; border-left: 3px solid #bfa6ff; padding: 12px; border-radius: 6px;">
                "<i>{analysis["empatheticReflection"]}</i>"
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        # Details inside Bento tabs
        tab_trigger, tab_doubt, tab_burnout, tab_coping = st.tabs([
            "🔍 Stress Triggers", 
            "🤔 Self-Doubt Patterns", 
            "🔋 Burnout Warning Signs", 
            "🕊️ Tailored Coping Steps"
        ])
        
        with tab_trigger:
            for trig in analysis["stressTriggers"]:
                st.markdown(f"🚨 **{trig}**")
                
        with tab_doubt:
            for db in analysis["selfDoubtPatterns"]:
                st.markdown(f"💭 {db}")
                
        with tab_burnout:
            for bo in analysis["burnoutCues"]:
                st.markdown(f"🪫 {bo}")
                
        with tab_coping:
            for idx, plan_step in enumerate(analysis["copingPlan"], 1):
                st.success(f"{idx}. {plan_step}")

# ---------------------------------------------------------------------------
# EMOTIONAL CHAT SIDEBAR (COMPANIONBOT)
# ---------------------------------------------------------------------------
with col2:
    st.markdown("<h2 style='font-family: Fredoka, sans-serif; color: #bfa6ff; text-align: center; margin-top:20px;'>🌸 Talk to Saathi</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #a49fc4;'>Your digital buddy, right here beside you. Tell me your troubles, ask for a quick study break game, or try a guided deep breathing drill!</p>", unsafe_allow_html=True)

    # Area to render messages in a container
    chat_container = st.container(height=500)
    
    with chat_container:
        for msg in st.session_state.chat_history:
            if msg["role"] == "user":
                with st.chat_message("user", avatar="🧠"):
                    st.write(msg["text"])
            else:
                with st.chat_message("assistant", avatar="🌸"):
                    st.write(msg["text"])

    # User chat input
    user_msg_input = st.chat_input("Pour your heart out here... E.g., Help me calm down my heart racing, or give me a 2-min focus booster.")

    if user_msg_input:
        # Append User Message to session state
        st.session_state.chat_history.append({"role": "user", "text": user_msg_input})
        
        # Immediate display
        with chat_container:
            with st.chat_message("user", avatar="🧠"):
                st.write(user_msg_input)
        
        # Generate model companion output
        with chat_container:
            with st.chat_message("assistant", avatar="🌸"):
                response_placeholder = st.empty()
                
                if not client:
                    # Mock interactive prompts
                    mock_res = "You have so much focus and mental drive in you, buddy. Take a slow deep breath right now. Let's do a 4-second inhale: Inhale... 1, 2, 3, 4. Now hold it for 4... and release it slowly. Notice the physical tension in your temples easing. It is alright. I am here with you. Write to me anytime."
                    if "breath" in user_msg_input.lower() or "calm" in user_msg_input.lower():
                        mock_res = "Let's perform a 5-minute somatic grounding drill together. I want you to look around you and mentally name: 5 things you can see, 4 tactile things you can feel (like the chair or keyboard), 3 sounds you can hear, 2 things you can smell, and 1 nice thing about yourself. Ready? Tell me what you notice. 🌸"
                    st.session_state.chat_history.append({"role": "model", "text": mock_res})
                    response_placeholder.write(mock_res)
                else:
                    try:
                        # Prepend journal context if available in state
                        journal_context_str = ""
                        if st.session_state.journal_entry:
                            journal_context_str = f"\n[Active Context from Student's Recent Safe Journal]:\nCategory: {st.session_state.last_analysis.get('stressLevelCategory', 'Unknown') if st.session_state.last_analysis else 'Analyzing'}\nReflection: {st.session_state.last_analysis.get('empatheticReflection', '') if st.session_state.last_analysis else ''}\n"
                            
                        full_instruction = SYSTEM_INSTRUCTION + journal_context_str
                        
                        # Prepare SDK chat payloads
                        chat_history_payload = []
                        for m in st.session_state.chat_history[:-1]:
                            chat_history_payload.append(types.Content(
                                role="user" if m["role"] == "user" else "model",
                                parts=[types.Part.from_text(text=m["text"])]
                            ))
                        
                        # Create chat and send message stream
                        chat_session = client.chats.create(
                            model="gemini-3.5-flash",
                            history=chat_history_payload,
                            config=types.GenerateContentConfig(
                                system_instruction=full_instruction,
                                temperature=0.7
                            )
                        )
                        
                        # Stream the result
                        response_stream = chat_session.send_message_stream(message=user_msg_input)
                        full_text = ""
                        for chunk in response_stream:
                            full_text += chunk.text
                            response_placeholder.write(full_text)
                            
                        # Save response to history
                        st.session_state.chat_history.append({"role": "model", "text": full_text})
                    except Exception as err:
                        st.error(f"Companion took a pause: {err}")
        st.rerun()

st.sidebar.markdown("---")
st.sidebar.markdown("""
### 🌸 About Saathi
Saathi utilizes advanced **Gemini 3.5 Flash** psychological modeling to detect deep-seated emotional overload, self-doubt loops, and burnout signs early, in a comforting UI designed to ease anxious eyes.

Feel proud of the effort you're putting into your dreams today!
""")
