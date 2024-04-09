import pathlib
import textwrap
import os

import google.generativeai as genai


GOOGLE_API_KEY = 'AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw'
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')


# number 1
"""
product = '''Waste recycling management system website'''
product_vision = 'A waste recycling management system website connects users with local recycling facilities, enabling them to search locations, schedule pickups (if applicable), and view relevant information for responsible waste disposal.'
user_stories = '''[
As a user, I want to click on the address, so that it takes me to a new tab with Google Maps.
As a user, I want to be able to anonymously view public information, so that I know about recycling centers near me before creating an account.
As a user, I want to be able to enter my zip code and get a list of nearby recycling facilities, so that I can determine which ones I should consider.
As a user, I want to be able to get the hours of each recycling facility, so that I can arrange drop-offs on my off days or during after-work hours.
As a user, I want to have a flexible pick up time, so that I can more conveniently use the website.
As a user, I want to be able to select different types of recyclable waste, so I have and get a list of facilities that accept each type and their opening hours, so that I can find an optimal route and schedule.
As a user, I want to add donation centers as favorites on my profile, so that I can view them later.
As a user, I want to be able to give my email ID, so that I can receive notifications for new events as they are posted.
As a user, I want to be able to view a map display of the public recycling bins around my area.
As a user, I want to be able to view a map display of the special waste drop off sites around my area.
As a user, I want to be able to view the safe disposal events currently being organised around my area.
As a user, I want to choose a flexible pick up time, so that I can more conveniently use the website.
As a user, I want to view user documentation for the website, so that I know how to use the web app.
As a user, I want to get feedback when I enter an invalid zip code.
As a user, I want to be able to create an acocunt, so that I can create my own profile.
As an admin, I want to be able to add or remove recycling facilities' information, so that users get the most recent information.
As an admin, I want to be able to read users' feedback and complaints, so that we can add more features and keep improving the service we provide to them.
As a user, I want to be able to check transaction history and keep a record of it, so that I can go back when needed.
As a user, I want to have a great UI and UX from the sites, so that I have a pleasant experience when navigating through them.
As a user, I want to be able to access the site and do all the other stuffs on all of my electronic devices.
As an admin, I want to be able to block specific users based on IP address, so that I can prevent spamming on the websites.
As an admin, I want to view a dashboard that monitors all the sites' statuses, so that I can have a sense of what people are doing on our sites and know the service status.
As an admin, I want to have all data encrypted, so that important information will not be stolen during a server breach or an attack.
As an executive, I want to have full access to data related to my company, so that I can have a sense of my company's performance.
As an employee, I want to access the route planning system during work, so that I can be guided through the neighbourhood.
As an employee from the HR department, I want to have access to the full information of all employees working for this business.
As a developer, I want to access an API from the website, so that I can integrate it and implement certain features in my own iOS application.
As a user, I want to be able to receive tempting rewards, so that I have a reason to use the website.
As a user, I want to have my personal information kept securely in the database of the website, so that I will not suffer from identity theft or telephone harassment.
As an admin, I want to handle all users' activities, so that I can manage more efficiently.
As a company, I want to have a website that is easy to use, so that I can upload or delete stuff step by step.
As an employee, I want to get quick notifications, so that I can process cases the first time.
As a company accountant, I want to view all available activity fees online, so that I can easily create a bill statement.
As a developer, I want to use bootstrap in the process of developing, so that I can easily design my website.
As a developer, I want to attend some UI/UX lessons, so that I can develop an awesome and beautiful features website.
As a user, I want to view all locations of recycling centers on a map, so that I can check which routes to take to drop off waste.
]
'''
"""


# number 2
product = '''Instant messaging app'''
product_vision = 'An instant messaging app is a real-time communication platform that enables users to exchange text messages, fostering connections and facilitating collaboration'
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



prompt = f'''
You are a helpful Scrum assistant helping me with estimating user stories.
Note, that product of current project is software. Product is not connected with Scrum methodology, unless it is specified explicitly.

I will provide you with the following information:
Product: the name of the product
Product Vision: a desired state (rather description) of product being developed.
User stories: a list of user story titles and existing estimation for each.

Your task is to generate estimation for each user story. Estimation must have measure of story points.
Estimation must express how many effort a user story will require to be completed, relative to other user stories.
During estimation, take existing estimations as a basis for estimationg the rest of user stories.

Estimations should not contradict each other.

Estimation is integer number that is bigger than 0.

In response you should include all user stories in original provided for you

You should return JSON list of all user stories in the following format.
RESPONSE FORMAT:
[
  {'{'}
    "title": "Title of User story that is provided for you"
    "estimation": "estimation of this user story in storypoints"
  {'}'},
  ...
]

Product: {product}
Product Vision: {product_vision}
User stories: {user_stories}

Make sure you return nothing except valid JSON.
'''


response = model.generate_content(prompt)

print(response.text)

#print("\n\n\n\n\n\n" + str(response.candidates))

# print("\n\n\n\n\n\n" + str(response.candidates[0]))

#print("\n\n\n\n\n\n" + str(response.candidates[0].token_count))