# Scrum

## Functional Requirements  

### FR0 - Web Page Functionality  
  * ~~FR0.1 Registration / Login System~~  
  * ~~FR0.2 Posting and Editing Listing~~
  * ~~FR0.3 Filtering Results~~
  * **FR0.4 Account Modification (Planned for future release)**
  * ~~FR0.5 Barcode Scanning~~
  * ~~FR0.6 Navigation/Links~~
  * ~~FR0.7 Integrated Map (With Markers)~~
  * ~~FR0.8 Chat Service~~
  * **FR0.9 Point System (Planned for future release)**
  * ~~FR0.10 User Rating System~~
  * ~~FR0.11 Password Control~~
  * ~~FR0.12 Notifications~~
  * ~~FR0.13 Server-side Post Filtering~~
  * ~~FR0.14 Advanced Filtering Results~~

### FR1 - Back-End Server Functionality  
  * ~~FR1.1 Database Management~~  
  * ~~FR1.2 Intelligent Data Analysis~~  

## Non-Functional Requirements

### NFR0 - Security
  * ~~NFR0.1 Encryption~~
  * ~~NFR0.2 Access Control~~  

### NFR1 - Usability - Web Page Design
  * ~~NFR1.1 Accommodating for those with additional needs~~
  * ~~NFR1.2 Device Compatibility~~  

### NFR2 - Reliability - Server Uptime
  * **NFR2.1 Crash Recovery (Planned for future release)**
  * ~~NFR2.2 Server Backup~~

## Descriptions

### FR0.1 Registration / Login System  
>No matter the device, the user should be able to log in to the website securely and without difficulty. The security procedures are as follows:   
>* Passwords must be over a specific length and requires symbols and/or capital letters.
>* Passwords must be typed out twice when being set.
>* Usernames must be unique.
>* Receive email confirmation upon account creation.  
>* Recover a user’s password and username via email.

### FR0.2 Posting and Editing Listing
>Signed in users should be able to post or edit listings of waste food. These listing should include:
>* Food name
>* Expiration Data
>* Applicable allergies risks
>* Optional picture of food
>* Pickup location
>* Optional written details

### FR0.3 Filtering Results
>When viewing the results for an item search a user should be able to filter the results. The data returned from the search will be done server side (see FRx.y) however once the data has been returned, reordering and sorting of the data will be done in the web page.
>* Some of the possible filters are:
>* Filter by location
>* Filter by type of food
>* Filter by allergies
>* Filter by freshness

### FR0.4 Account Modification
>The user should be able to modify their account information. This includes:
>* Changing the email associated with the account.
>* Changing their username/password combination.
>* Alter other account information, e.g. reset home location, etc.  
>
>Once the user has confirmed the changes the system should then display the modified account data.

### FR0.5 Barcode Scanning
>Users should be able to scan the barcode of a product to automatically populate the details of a new listing.

### FR0.6 Navigation/Links
>Navigating the website should be easy and user-friendly. This will be achieved via the following:
>* There will be a Menu Bar at/near the top of the page.
>* The logo will always be at the same location and will link back to the Home page.
>* Any menu will be well-organised and, if necessary, will include sub-menus allowing the user to efficiently navigate.
>* All links should work correctly and follow good website principles such as not taking too many “clicks” to make it to any one sub-webpage.

### FR0.7 Integrated Map (With Markers)
>The website should have an embedded Google Maps feature in either a static mode for preview, or interactive mode, for more details. Additionally, the map should have the following features:
>* Markers that highlight specific areas such as the location of other users, or agreed meetup positions.
>* Clicking on (or hovering over) a marker should reveal more detail of the marker target.
>* It should be integrated with the other site functions, such as the filter results option.

### FR0.8 Chat Service
>Upon a user finding an upload they are interested in, the website provides a way for them to contact one another. At the very least the users must be able to get one anothers contact details (e.g. phone number, email address, etc).  
>However, ideally there would be an option to talk to one another through a chat function on the website. This would be done through an instant messaging service. If the receiving user is not online it would be sent through an in-built email system, prompting the user to login to the online chat system to reply.

### FR0.9 Point System
>Users get virtual points for doing various tasks in the system which will add a competitive element to the system and motivate the users to get involved more, examples of tasks that users could gain points for are;
>* Getting a good user rating
>* Delivering food to someone
>* Offering food
>* Filling out the user and food descriptions accurately, with little to no empty fields
>
>Note: There will not be points for collecting food as it may motivate people to collect more food than they need and then end up wasting it themselves.

### FR0.10 User Rating System
>Users can rate others but only after a successful exchange. This will give people a sense of reliability and trust. It will also help prevent people from misusing the program. The rating will be done based on various factors, including:
>* If they asked for money (negatively rated)
>* If the food was fresh (positively rated)
>* If the user was friendly (positively rated)
>* If the user was helpful (positively rated)

### FR0.11 Password Control
>The system should provide various options to help with password security as this is a very common “system flaw”. There are a few ways to make sure the user has the tools necessary to keep their account secure such as;
>* The account being locked temporarily if the password is entered wrong too many times and then asking the user to change their password if they enter it wrong again too many times once the allocated lock time has finished.
>* Email confirmation link or SMS sent access code to verify that it is the user trying to recover their forgotten password.
>* The user being asked to regularly change their password and making sure that it holds as a “strong” password each time.

### FR0.12 Notifications
>When there are updates in the system that are important for the user to know, the app will send a notification to the mobile devices notification manager. When the user clicks on the notification the app will open. (if the notification manager allows this)  
Notification scenarios include;
>* Item the user wants is available.
>* Item the user is offering has been accepted.
>* Someone has messaged you in app.
>* An Item you were offering needs review (e.g. expired)

### FR0.13 Server-side Post Filtering
>The user should be able to alter both the sorting method and current filtering of the results. This includes:
>* Depending on the sorting method chosen by the user, the results should reload correctly (and independent of the previously used sorting mechanism).
>* After a user has chosen a new set of filters, the results should reload and display the relevant posts.

### FR0.14 Advanced Filtering Results
>A user can filter results in a list or a map with more advanced options. When viewing the results in a list or a map a user should be able to filter the results according to the following additional criteria:
>* Age of post
>* Rating of user who posted
>* Prefer posts with pictures
>* Prefer posts with written descriptions

### FR1.1 Database Management  
>The system needs a database functionality to store user data which can be updated to change the data (e.g. adding a new user) and to also store extra data such as food wastage statistics in a specific area. Some of the functions the database requires are;
>* Add a user to the database
>* Delete a user from the database
>* Modify a user’s data in the database
>* All the above for other data
>
>Each of the above is done by the system upon user interaction such as; When a user registers the system adds the to the database.
Or in the case of an admin needing to edit the system manually (Unlikely but possible)

### FR1.2 Intelligent Data Analysis  
>Throughout the lifetime of the system, statistical data will be collected which the user will be made aware of in the system Terms & Conditions.
 All patterns and data collected off users will be analyzed to make intelligent suggestions for how to reduce waste e.g. If the user has given away bread a lot then a suggestion would be given to buy less bread.
 The suggestions will be given on the home page in a non-intrusive way.
 Some data will also be used externally such as being available to local waste management companies, environmental groups and government groups.

### NFR0.1 Encryption
>Ideally all data should be encrypted but as a minimum all sensitive data should be encrypted. E.g. Name, Address, Phone Number, etc.  
 This should be done with the strongest encryption method possible for us to reasonably implement. This will be tested by inspecting sent packages to and from the server for encryption.

### NFR0.2 Access Control
>The system should flag every time there is a login to a specific account from a new location or a new device. This flag could be an automatic email sent to the user stating at what time and where the account was accessed from. The email would include a “if this wasn’t you” option where upon clicking it would refer the user to a company phone number. This will be tested by trial running hijacking dummy accounts.

### NFR1.1 Accommodating for those with additional needs.
>The website needs to be able to be used by various types of additional needs. This includes disabilities such as; impaired vision, colour blindness, deaf, blind, etc.  
 The website should be able to make the website as nice as possible to use to as many of these conditions as possible. Some of the possible ways to accommodate some of these conditions are;
>* A colorblind mode where the colour scheme will change.
>* A large font size mode for vision impaired people.
>* A text option (e.g. subtitles) for any audio on the website.
>
>This will be tested by trial study with relevant users.

### NFR1.2 Device Compatibility  
>The web page should load on multiple devices such as mobile and laptop due to its responsive design. However, this could result in the following issues:
>* Maps not loading and having no backup option
>* Tables and other objects going off screen and not being able to see/access them
>* The page displaying in a way in which it is unreasonable to navigate it e.g. having a very large scroll bar
>* The pages taking way too long to load on a mobile device due to internet speed constraints and device processor power
>
>This will be tested by taking a sample of test devices and observing the reported usability of a test sample of users.

### NFR2.1 Crash Recovery
>We are aiming for a minimum of 98% uptime. To achieve this we aim to include various factors such as:
>* Recovering data that may have been mid-access when the server crashed
>* Making sure all data is valid/not corrupted before the server goes back up
>* Make sure all functions are working correctly before the server goes back up
>* Notice when the server has crashed as fast as possible, automatically preferably
>* Have the recovery process be as fast as possible while not compromising quality/accuracy
>* An error log of the crash is made as to prevent future crashes
>
>This will be tested by tracking server uptime in a trail run and comparing it against our target number.

### NFR2.2 Server Backup
>The server needs to take a regular backup of its data to a separate database so that data can be recovered if necessary. This should be done regularly, and will be incremental (only update changes made).  
 This will be done on an automated timeframe chosen by the client with the help of the system. This will be tested by crashing a test server and analysing the lost data.
