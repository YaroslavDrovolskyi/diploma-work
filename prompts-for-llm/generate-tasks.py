import pathlib
import textwrap
import os

import google.generativeai as genai


GOOGLE_API_KEY = 'AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw'
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# number 1
"""
task_count = 100
product = '''Food delivery app'''
product_vision = 'A mobile application that connects users with local restaurants, enabling them to browse menus, order food delivery, and track their orders in real-time'
technologies = 'Kotlin frontend, Java backend, MySQL DBMS, AWS, Stripe secure payment gateway'
user_story_name = 'As a user, I want to browse the menu of a selected restaurant, including descriptions, prices, and photos of the dishes so that I can make informed decisions about my order'
user_story_description = 'This user story addresses in-app restaurant menu browsing. Users should be able to view detailed information about menu items before placing an order.'
user_story_acpt_criteria = ''
tasks = '[]'
"""

# number 2
"""
task_count = 100
product = '''Food delivery app'''
product_vision = 'A mobile application that connects users with local restaurants, enabling them to browse menus, order food delivery, and track their orders in real-time'
technologies = 'Kotlin frontend, Java backend, MySQL DBMS, AWS, Stripe secure payment gateway'
user_story_name = 'As a user, I want to track the real-time location of my food delivery on a map so that I can see its estimated arrival time'
user_story_description = 'This user story incorporates order tracking functionality. Users should be able to visualize their order\'s location and estimated delivery time on a map.'
user_story_acpt_criteria = ''
tasks = '[]'
"""

# number 3 (included tasks generated in number3)
"""
task_count = 10
product = '''Food delivery app'''
product_vision = 'A mobile application that connects users with local restaurants, enabling them to browse menus, order food delivery, and track their orders in real-time'
technologies = 'Kotlin frontend, Java backend, MySQL DBMS, AWS, Stripe secure payment gateway'
user_story_name = 'As a user, I want to track the real-time location of my food delivery on a map so that I can see its estimated arrival time'
user_story_description = 'This user story incorporates order tracking functionality. Users should be able to visualize their order\'s location and estimated delivery time on a map.'
user_story_acpt_criteria = ''
tasks = '''
[
  {
    "task": "Create a real-time order tracking map",
    "description": "Implement a map widget that displays the real-time location of the delivery person and the estimated arrival time of the order."
  },
  {
    "task": "Integrate GPS tracking into the delivery app",
    "description": "Establish a mechanism for the delivery person's mobile device to transmit their GPS coordinates to the backend server."
  },
  {
    "task": "Display estimated arrival time on the map",
    "description": "Calculate the estimated arrival time based on the delivery person's current location, the destination address, and traffic conditions."
  },
  {
    "task": "Update the map and ETA in real-time",
    "description": "Continuously update the map and ETA as the delivery person moves towards the destination."
  },
  {
    "task": "Handle GPS location errors",
    "description": "Implement error handling mechanisms to gracefully handle cases where GPS data is unavailable or unreliable."
  },
  {
    "task": "Design the UI for the order tracking map",
    "description": "Create user-friendly and aesthetically pleasing UI for the order tracking map."
  },
  {
    "task": "Implement the map zooming and panning features",
    "description": "Allow users to zoom in and pan the map to view the delivery location and its surroundings."
  },
  {
    "task": "Add a legend to the map",
    "description": "Create a legend that explains the symbols and colors used on the map."
  },
  {
    "task": "Optimize the map loading speed",
    "description": "Implement techniques to optimize the loading time of the map and minimize data usage."
  },
  {
    "task": "Test the order tracking map functionality",
    "description": "Conduct thorough testing to ensure that the order tracking map functions as expected in various scenarios."
  }
]
'''
"""



# number 4
"""
task_count = 10
product = '''Instant messaging app'''
product_vision = 'An instant messaging app is a real-time communication platform that enables users to exchange text messages, fostering connections and facilitating collaboration.'
technologies = 'Qt C++ frontend, Java backend, MySQL DBMS, WebSocket communication protocol'
user_story_name = 'As a user, I want to initiate a one-on-one chat with another user so that I can have a private conversation'
user_story_description = 'This user story establishes core messaging functionality. Users should be able to start private chats with each other.'
user_story_acpt_criteria = ''
tasks = '[]'
"""

# desctop
# number 5
task_count = 10
product = '''Image editing app'''
product_vision = 'An image desktop editing app is a software application that allows users to manipulate digital images, enhancing their visual appearance and applying creative effects'
technologies = 'Qt C++ frontend, OpenCV image processing library'
user_story_name = 'As a user, I want to apply different filters to my photos so that I can add artistic styles and visual flair'
user_story_description = 'Users should be able to apply pre-defined filters and effects to create unique visual styles.'
user_story_acpt_criteria = ''
tasks = '[]'



prompt = f'''
You are a helpful Scrum assistant. Now your job is to help me define tasks for user story in context of product under developing.
Note, that product is software. 
Product is not connected with Scrum methodology, unless it is specified explicitly.

Your responses contain only valid JSON.

I will give you the following information:
Product: the name of the product
Product Vision: a desired state (rather description) of product being developed.
Technologies used: list of technologies/methods used for developing Product.
User Story Name: Description of the user story in format of "As a [user role], I want [goal/desire] so that [benefit]".
User Story Description: Slightly more detailed description and specific information of user story.
User Story Acceptance criteria: the acceptance criteria for the user story
Existing tasks: a list of existing task names (for this user story) that you should not mention again.

Your job is to help me identify tasks for this user story. There can be any number of tasks. Identify as many as possible but at most {task_count}.
You should only include tasks in your output that are relevant for implementing the user story and which have not been included in the existing tasks list.

Make sure that:
1. Generated tasks are highly relevant for technologies used
2. Each generated task is small enough to be completed by one worker within a day
3. Each generated task has sufficient level of detail for implementation
4. You should stop generating tasks when you think that the list is complete
5. The full list of existing tasks and the new tasks that you will generate together should represent a complete set of tasks to implement given user story
6. Tasks should not contradict each other
7. Generate only at most {task_count} tasks at a time or an empty list if you are done.
8. Do not repeat any of the existing tasks.


The tasks should be returned as a JSON list in the following format. 
RESPONSE FORMAT:
[
  {'{'}
    "task": "task title",
    "description": "task detail description"
  {'}'},
  ...
]


Make sure that task titles are unique and cover different aspects of implementation a user story. 
Do not repeat yourself and do not include existing tasks.

Do not reply with anything else besides valid JSON data.

Product: {product}
Product Vision: {product_vision}
Technologies used: {technologies}
User Story Name: {user_story_name}
User Story Description: {user_story_description}
User Story Acceptance criteria: {user_story_acpt_criteria}
Existing tasks: {tasks}
'''



response = model.generate_content(prompt)

print(response.text)