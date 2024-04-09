import pathlib
import textwrap
import os

import google.generativeai as genai

### How to run: python refinement-user-story.py

GOOGLE_API_KEY = 'AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw'
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')


# number 1
"""
sprint_weeks_count = 4
user_stories_count = 100
product = "Food delivery app"
product_vision = "A mobile application that connects users with local restaurants, enabling them to browse menus, order food delivery, and track their orders in real-time"
user_stories = '''[
    {
        "name":"As a user, I want to search for restaurants by location or cuisine type so that I can easily find restaurants offering the food I'm craving",
        "description":"This user story focuses on restaurant discovery. Users should be able to find restaurants based on their location or the type of cuisine they're interested in."
    },
    {
        "name":"As a user, I want to browse the menu of a selected restaurant, including descriptions, prices, and photos of the dishes so that I can make informed decisions about my order",
        "description":"This user story addresses in-app restaurant menu browsing. Users should be able to view detailed information about menu items before placing an order."
    },
    {
        "name":"As a user, I want to add items to my cart, customize them with options and instructions, and see the total price of my order before checkout so that I can easily build and manage my order",
        "description":"This user story focuses on order creation. Users should be able to add items to their cart, personalize them, and see the accumulating cost."
    },
    {
        "name":"As a user, I want to select a preferred delivery time or schedule my order for later so that my food arrives when it's most convenient for me",
        "description":"This user story introduces delivery time flexibility. Users should be able to choose a preferred delivery time or schedule their order in advance."
    },
    {
        "name":"As a user, I want to securely pay for my order using a debit or credit card stored in the app so that I can complete the transaction quickly and conveniently",
        "description":"This user story addresses secure in-app payment processing. Users should be able to pay for their orders using saved payment methods."
    },
    {
        "name":"As a user, I want to track the real-time location of my food delivery on a map so that I can see its estimated arrival time",
        "description":"This user story incorporates order tracking functionality. Users should be able to visualize their order's location and estimated delivery time on a map."
    },
    {
        "name":"As a user, I want to rate and review restaurants and my overall delivery experience so that I can share feedback and help others make informed decisions",
        "description":"This user story focuses on user feedback. Users should be able to rate and review restaurants and their delivery experiences to contribute to the platform."
    },
    {
        "name":"As a restaurant owner, I want to manage my menu and receive orders through the app so that I can reach more customers and streamline my delivery process",
        "description":"This user story considers restaurant owners. The app should provide a platform for them to manage their menus and receive delivery orders."
    },
    {
        "name":"As a delivery driver, I want to see available delivery tasks and optimize my route based on multiple deliveries so that I can efficiently fulfill orders and maximize earnings",
        "description":"This user story addresses delivery driver needs. The app should provide a system for drivers to see available deliveries and optimize their routes for efficiency."
    },
    {
        "name":"As an app administrator, I want to monitor overall app activity, user engagement, and delivery success rates so that I can measure performance and make data-driven improvements",
        "description":"This user story caters to app administrators. The app should provide insights and data on user activity, engagement, and delivery success rates to inform improvements."
    }
]
'''
"""

# number 2
"""
sprint_weeks_count = 4
user_stories_count = 100
product = "Instant messaging app"
product_vision = "An instant messaging app is a real-time communication platform that enables users to exchange text messages, fostering connections and facilitating collaboration"
user_stories = '''[
    {
        "name":"As a new user, I want to sign up for an account with a username and password so that I can start using the app to communicate with others",
        "description":"This user story focuses on user registration and creating a new account. It includes specifying a username and password for login credentials."
    },
    {
        "name":"As an existing user, I want to search for other users by username or email address so that I can easily find and connect with people I know",
        "description":"This user story addresses user discovery and search functionality. Users should be able to find each other using usernames or email addresses."
    },
    {
        "name":"As a user, I want to initiate a one-on-one chat with another user so that I can have a private conversation",
        "description":"This user story establishes core messaging functionality. Users should be able to start private chats with each other."
    },
    {
        "name":"As a user in a chat, I want to send and receive text messages in real-time so that I can have a fluid conversation with the other person",
        "description":"This user story focuses on real-time messaging. Users should be able to send and receive text messages instantly within a chat."
    },
    {
        "name":"As a user in a chat, I want to see if the other user is online and their last active time so that I know their availability",
        "description":"This user story introduces user presence information. Users should be able to see if their chat partners are online or recently active."
    },
    {
        "name":"As a user, I want to create a group chat with multiple people so that I can communicate with a larger group at once",
        "description":"This user story expands messaging capabilities to groups. Users should be able to create and participate in group chats."
    },
    {
        "name":"As a user in a chat, I want to send emojis and emoticons to express myself more creatively so that I can enhance my communication",
        "description":"This user story incorporates expressive elements. Users should be able to use emojis and emoticons to add a creative touch to their messages."
    },
    {
        "name":"As a user in a chat, I want to attach files, such as images and documents, to my messages so that I can share additional information",
        "description":"This user story introduces file sharing functionality. Users should be able to attach files to their messages for richer communication."
    },
    {
        "name":"As a developer, I want access to an API for the app so that I can integrate instant messaging functionalities into other applications",
        "description":"This user story caters to developers. The app should provide an API for integrating its features into other applications."
    },
    {
        "name":"As a user, I want to customize my profile with a picture and bio so that I can express myself and be more recognizable to others",
        "description":"This user story focuses on user profiles. Users should be able to personalize their profiles with a picture and bio."
    }
]
'''
"""



# number 3
sprint_weeks_count = 4
user_stories_count = 100
product = "Image editing app"
product_vision = "An image editing app is a software application that allows users to manipulate digital images, enhancing their visual appearance and applying creative effects."
user_stories = '''[
    {
        "name":"As a casual user, I want to crop and resize my photos so that I can adjust their composition and framing for better visual impact",
        "description":"This user story focuses on basic image manipulation. Users should be able to crop unwanted parts and resize photos to desired dimensions."
    },
    {
        "name":"As a photo enthusiast, I want to adjust the brightness, contrast, and saturation of my photos so that I can fine-tune their overall light and color balance",
        "description":"This user story introduces color and light editing tools. Users should be able to adjust basic properties like brightness, contrast, and saturation to enhance their photos."
    },
    {
        "name":"As a creative user, I want to apply filters and effects to my photos so that I can add artistic styles and visual flair",
        "description":"This user story incorporates artistic manipulation. Users should be able to apply pre-defined filters and effects to create unique visual styles."
    },
    {
        "name":"As a user, I want to rotate and flip my photos so that I can correct their orientation and achieve the desired composition",
        "description":"This user story addresses basic image rotation and flipping. Users should be able to rotate and flip photos to adjust their orientation for better viewing."
    },
    {
        "name":"As a user, I want to sharpen or blur parts of my photo to selectively draw attention or create a sense of depth",
        "description":"This user story introduces selective focus tools. Users should be able to sharpen specific areas or blur backgrounds to enhance the focus of their photos."
    },
    {
        "name":"As a user, I want to reduce red-eye and blemishes in my photos so that I can improve the overall quality and clarity of portraits",
        "description":"This user story incorporates blemish removal tools. Users should be able to fix common imperfections like red-eye and blemishes for more polished portraits."
    },
    {
        "name":"As a user, I want to adjust the color temperature of my photos to create a warmer or cooler mood",
        "description":"This user story introduces color temperature adjustment. Users should be able to shift the overall color temperature of their photos to achieve a warmer or cooler aesthetic."
    },
    {
        "name":"As a user, I want to save my edited photos in different file formats and resolutions so that I can choose the right format for my needs",
        "description":"This user story addresses image export options. Users should be able to save their edited photos in various file formats and resolutions depending on their intended use."
    },
    {
        "name":"As a professional user, I want to work with layers and masks for advanced editing so that I can achieve complex image manipulations",
        "description":"This user story introduces advanced editing features. Professionals should have access to layers and masks for precise control over image manipulation."
    },
    {
        "name":"As a user, I want to undo and redo my editing steps so that I can experiment and correct mistakes without permanently altering my photos",
        "description":"This user story incorporates non-destructive editing functionalities. Users should be able to undo and redo editing steps to maintain flexibility and avoid permanent changes."
    }
]
'''




prompt = f'''
You are a helpful Scrum assistant. Now your job is to help me in deciding what user stories to take in sprint in context of product under developing.
Note, that product is software. Product is not connected with Scrum methodology, unless it is specified explicitly.

I will give you the following information:
Product: the name of the product
Product Vision: a desired state (rather description) of product being developed.
User Stories: list of user stories, from which you should choose.

Your job is to return me a list of user stories, selected from given list, that are the best to take in new sprint. 
The sprint is scheduled to continue {sprint_weeks_count} weeks.
There can be any number of user stories. Select as many as possible but at most {user_stories_count}.

Your answer should be highly relevant according to product vision, to sprint duration, to importance and estimation of user stories.

Make sure that:
1. Each selected user story is from provided list.
2. All selected user stories can be completed during the sprint
3. You should stop selecting user stories when you think that it is enough for one sprint
4. List of selected user stories after completion must add a value for customer of product under development
5. Do not repeat any of the user story in list.
6. User stories in list must be sorted according to their importance 


The user stories should be returned as a JSON list in the following format. 
RESPONSE FORMAT:
[
  {'{'}
    "name": "name of selected user story",
  {'}'},
  ...
]

Do not reply with anything else besides valid JSON data.


Product: {product}
Product Vision: {product_vision}
User stories: {user_stories}
'''



response = model.generate_content(prompt)

print(response.text)