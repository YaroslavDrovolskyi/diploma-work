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
words_count = 200
product = "Food delivery app"
product_vision = "A mobile application that connects users with local restaurants, enabling them to browse menus, order food delivery, and track their orders in real-time"
user_story = '''{
  "name":"As a user, I want to track the real-time location of my food delivery on a map so that I can see its estimated arrival time",
  "description":"This user story incorporates order tracking functionality. Users should be able to visualize their order's location and estimated delivery time on a map."
}
'''
other_user_stories = '''[
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
words_count = 200
product = "Food delivery app"
product_vision = "A mobile application that connects users with local restaurants, enabling them to browse menus, order food delivery, and track their orders in real-time"
user_story = '''{
	"name":"As a restaurant owner, I want to manage my menu and receive orders through the app so that I can reach more customers and streamline my delivery process",
	"description":"This user story considers restaurant owners. The app should provide a platform for them to manage their menus and receive delivery orders."
}
'''
other_user_stories = '''[
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


# number 3
words_count = 200
product = "Image editing app"
product_vision = "An image editing app is a software application that allows users to manipulate digital images, enhancing their visual appearance and applying creative effects."
user_story = '''{
        "name":"As a user, I want to rotate and flip my photos so that I can correct their orientation and achieve the desired composition",
        "description":"This user story addresses basic image rotation and flipping. Users should be able to rotate and flip photos to adjust their orientation for better viewing."
    }
'''
other_user_stories = '''[
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
You are a helpful Scrum assistant. Now your job is to help me in refinement of user story in context of product under developing.
Note, that product is software. Product is not connected with Scrum methodology, unless it is specified explicitly.

I will give you the following information:
Product: the name of the product
Product Vision: a desired state (rather description) of product being developed.
User Story: user story that you should refine
Other user stories: the rest of user stories


Your job is to give me advice how to refine this user story (select one of given variants and detail it): 
  - split (write the parts into which the user story should be broken down, but do not repeat any of the existing user story)
  - merge with some other user story (and write user story with which we should merge given user story)
  - delete user story because of duplicate, its redundancy or its senselessness (specify the exact reason)
  - other suggestion in free form

Your advice should be highly relevant according to product vision.

Make your advice as more detailed as it possible, but it should be at most {words_count} words.
You should stop generating advice when you think that it is complete.
Advice should not contain any markdown markup.

If you think that given user story is good and therefore does not need refinement, write respond with "User story is good therefore does not need refinement". 

Do not reply with anything else besides a plain text.

Product: {product}
Product Vision: {product_vision}
User story: {user_story}
Other user stories: {other_user_stories}
'''



response = model.generate_content(prompt)

print(response.text)