import logging
import warnings
from google.adk import Agent
from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool
from entities.product import PhoneRequirements, LaptopRequirements
from subagent_tools.FindProduct import product_consultation_tool
from google.adk.models.lite_llm import LiteLlm
logger = logging.getLogger(__name__)

GEMINI_2_FLASH = "gemini-2.0-flash"


IdentifyDeviceAgent = LlmAgent(
    name="IdentifyDeviceAgent",
    model=GEMINI_2_FLASH,
    description="An agent that identifies and classifies electronic devices based on user queries.",
    instruction='''You are NEXUS, a virtual assistant specializing in advising on smart electronic products. 
                Your task is to analyze the user's query and classify the type of device mentioned. 
                Based on the user's input identify the device type as one of the following: phone, laptop, earphone, backup charger, cable charger hub. If the device does not match these types, return 'other'. If the query is unclear, return 'unknown'.''',
    output_key="device_type"
)

# PhoneRequirementsAgent
PhoneRequirementsAgent = LlmAgent(
   name="PhoneRequirementsAgent",
   model=GEMINI_2_FLASH,
   description="An agent that parses user requirements for phones and maps them to the PhoneRequirements Pydantic model.",
   instruction='''You are NEXUS, a virtual assistant specializing in advising on smart electronic products. The user is asking about phones. Your task is to analyze the user's query and extract information according to the required structure.

1. Classify the user's requirements into general categories:
   - phone_highSpecs: True if the user needs a high-performance phone or good gaming capabilities (e.g., "high specs", "gaming phone"), otherwise False.
   - phone_battery: True if the user needs a phone with a large battery capacity (e.g., "long battery", "big battery"), otherwise False.
   - phone_camera: True if the user needs a phone with good photo or video capabilities (e.g., "good camera", "high-quality video"), otherwise False.
   - phone_livestream: True if the user needs a phone suitable for livestreaming (e.g., "for livestreaming", "streaming"), otherwise False.
   - phone_slimLight: True if the user prefers a slim or lightweight phone (e.g., "slim phone", "lightweight"), otherwise False.

2. Identify general information:
   - min_budget/max_budget: Price range (in VND, integer). If not mentioned, set to null.
     - Rules: 
       - "5-7 tr" -> min_budget=5000000, max_budget=7000000
       - "dưới 10 m" -> max_budget=10000000
       - "từ 8 triệu trở lên" -> min_budget=8000000
   - brand_preference: Preferred brand (e.g., "Appleස). If not mentioned, set to null.
   - specific_requirements: Special requirements (e.g., "camera chống rung" for anti-shake camera). If there are no other requirements that other fields in the json cannot cover, then add them. If not mentioned, set to null.

3. Return the result in the following JSON format:
   ```json
   {
     "phone_highSpecs": <true/false>,
     "phone_battery": <true/false>,
     "phone_camera": <true/false>,
     "phone_livestream": <true/false>,
     "phone_slimLight": <true/false>,
     "min_budget": <integer or null>,
     "max_budget": <integer or null>,
     "brand_preference": "<brand or null>",
     "specific_requirements": "<string or null>"
   }
    ```
    ''',
   output_schema=PhoneRequirements
)


LaptopRequirementsAgent = LlmAgent(
    name="LaptopRequirementsAgent",
    model=GEMINI_2_FLASH,
    description="An agent that parses user requirements for laptops and maps them to the LaptopRequirements Pydantic model.",
    instruction='''You are NEXUS, a virtual assistant specializing in advising on smart electronic products. The user is asking about laptops. Your task is to analyze the user's query and extract information according to the required structure.

1. Classify the user's requirements into general categories:
   - laptop_ai: True if the user needs a laptop for AI-related tasks (e.g., "machine learning", "AI development"), otherwise False.
   - laptop_engineer: True if the user needs a laptop for engineering tasks (e.g., "programming", "CAD", "software development"), otherwise False.
   - laptop_gaming: True if the user needs a laptop for gaming (e.g., "gaming laptop", "high graphics", "play games"), otherwise False.
   - laptop_graphic: True if the user needs a laptop for graphic design or video editing (e.g., "graphic design", "video editing", "Photoshop"), otherwise False.
   - laptop_office: True if the user needs a laptop for office work (e.g., "office tasks", "work", "Microsoft Office"), otherwise False.
   - laptop_premium: True if the user wants a premium or high-end laptop (e.g., "premium laptop", "luxury", "high-end"), otherwise False.
   - laptop_slimLight: True if the user prefers a slim or lightweight laptop (e.g., "slim laptop", "lightweight", "portable"), otherwise False.

2. Identify general information:
   - min_budget/max_budget: Price range (in VND, integer). If not mentioned, set to null.
     - Rules: 
       - "5-7 tr" -> min_budget=5000000, max_budget=7000000
       - "dưới 20 m" -> max_budget=20000000
       - "từ 15 triệu trở lên" -> min_budget=15000000
   - brand_preference: Preferred brand (e.g., "Dell", "MacBook", "Asus"). If not mentioned, set to null.
   - specific_requirements: Special requirements (e.g., "touchscreen", "16GB RAM"). Only add when other fields cannot be met, usually detailed configuration requirements. If the above fields are met, do not add. If not mentioned, set to null.

3. Return the result in the following JSON format:
   ```json
   {
     "laptop_ai": <true/false>,
     "laptop_engineer": <true/false>,
     "laptop_gaming": <true/false>,
     "laptop_graphic": <true/false>,
     "laptop_office": <true/false>,
     "laptop_premium": <true/false>,
     "laptop_slimLight": <true/false>,
     "min_budget": <integer or null>,
     "max_budget": <integer or null>,
     "brand_preference": "<brand or null>",
     "specific_requirements": "<string or null>"
   }
    ```
    ''',
   output_schema=LaptopRequirements
)

ParseRequirementAgent = LlmAgent(
    name="ParseRequirementAgent",
    model=GEMINI_2_FLASH,
    description="An agent that coordinates the parsing of user requirements for electronic products by delegating to specialized sub-agents based on the device type in session state.",
    instruction='''You are NextUS, a virtual assistant specializing in advising on smart electronic products. Your primary responsibility is to parse user requirements for electronic products. You use the device type stored in the session state key 'device_type' to delegate tasks to specialized sub-agents.

You have the following sub-agents:
1. PhoneRequirementsAgent: Handles requirements for phones (e.g., "I want a phone with a good camera").
2. LaptopRequirementsAgent: Handles requirements for laptops (e.g., "I need a laptop for programming").

Based on the user's query and the device type from session state key "device_type", perform the following steps:

1. Analyze the device type from session state:
   - If device_type is "phone", delegate the query to PhoneRequirementsAgent to parse phone-related requirements.
   - If device_type is "laptop", delegate the query to LaptopRequirementsAgent to parse laptop-related requirements.
   - If device_type is not recognized (e.g., null, "other", or any other value), respond with a JSON object: {"message": "Device type is not recognized. Please specify a phone or laptop."}.

2. Delegate to the appropriate sub-agent:
   - PhoneRequirementsAgent: Returns requirements like phone_highSpecs, phone_battery, min_budget, etc.
   - LaptopRequirementsAgent: Returns requirements like laptop_ai, laptop_engineer, min_budget, etc.

3. Return the parsed requirements in JSON format as provided by the sub-agent. If no sub-agent is applicable, return the error message as specified.
  ''',
   sub_agents=[PhoneRequirementsAgent, LaptopRequirementsAgent],
   output_key="parsed_requirements",
)


FilterProductAgent = LlmAgent(
    name="FilterProductAgent",
    model=GEMINI_2_FLASH,
    description="An agent that filters out product-related questions.",
    instruction='''You are NEXUS, a virtual assistant specializing in advising on smart electronic products.
    You have 3 tools:
    1. IdentifyDeviceAgent: Identifies the type of device (phone, laptop, etc.) based on user input.
    2. ParseRequirementAgent: Parses user requirements for phones and laptops based on the device type at state key `device_type`.
    3. product_consultation_tool: Searches for products based on parsed requirements and device type. By default it shows 5 products via top_k variable but user can also change it like top 1, best or top 10.
    Your role is the Filter Product Agent, responsible for searching and filtering electronic products (e.g., phones, laptops) based on user requirements. 
    1. Take the type of device provided in the session state key 'device_type' at IdentifyDeviceAgent.
    2. Take the user request and parse it into state key 'parsed_requirements' at ParseRequirementAgent.
    3. product_consultation_tool need 'device_type' and 'parsed_requirements' to parameter to use it. User can also change the top_k variable to show 1, 5, 10 or best products.
    You use the product_consultation_tool to search for products based on the state key 'parsed_requirements' and 'device_type'.You *only* print out the product_consultation_tool results to give feedback to the user. Do not generate the answer yourself.''',
    tools=[product_consultation_tool, AgentTool(agent=IdentifyDeviceAgent), AgentTool(agent=ParseRequirementAgent)],
    output_key="product_consultation",
)