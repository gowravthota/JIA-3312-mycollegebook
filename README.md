- [MyCollegeBook](#mycollegebook)
  - [Future Work](#future-work)
    - [Features to be Implemented](#features-to-be-implemented)
    - [Implementations to be fixed](#implementations-to-be-fixed)
- [Release Notes](#release-notes)
  - [0.5.0](#050)
    - [Features](#features)
    - [Bug Fixes](#bug-fixes)
    - [Known Bugs](#known-bugs)
  - [0.4.0](#040)
    - [Features](#features-1)
    - [Bug Fixes](#bug-fixes-1)
    - [Known Bugs](#known-bugs-1)
  - [0.3.0](#030)
    - [Features](#features-2)
    - [Bug Fixes](#bug-fixes-2)
    - [Known Bugs](#known-bugs-2)
  - [0.2.0](#020)
    - [Features](#features-3)
    - [Bug Fixes](#bug-fixes-3)
    - [Known Bugs](#known-bugs-3)
  - [0.1.0](#010)
    - [Features](#features-4)
    - [Bug Fixes](#bug-fixes-4)
    - [Known Bugs](#known-bugs-4)
- [Project Structure](#project-structure)
  - [Frontend Install](#frontend-install)
  - [Backend Install](#backend-install)

# MyCollegeBook

MyCollegeBook is an iOS/Android mobile application that allows university students to buy and sell used college textbooks.

## Future Work
Below are things that at minimum, should be added before deployment.

### Features to be Implemented
- User safety
  - Adding the ability to report a listing for an admin to view.
  - Screen the images using some kind of content safety tool (Amazon Rekognition, Google Content Safety, etc.)
- Set default pin location on a per-school basis.
  - Acquire a DB of school latitude and longitudes. Plug this into the model.
- Verify users by school email address.
  - Modify the user manager such that it verifies the email's ending exists within the existing UniversityDomain table.
- GPS location tracking for meeting up with a user.
  - This is something we never got to in the orginal documents. The user stories from our Detailed Design should explain more.
  - While locations can be specified for a book request, the app does not verify the user's location before they mark it as completed. This will need to be handled with consideration for the fact that users can decline location services.

### Implementations to be fixed
- There is a problem with contact information still being shown whenever viewing a user. Both in the book listing and in the meetup request.
- Transactions and keeping track of users are fairly fragile and could use unit tests as well as more database records created.
- Rating transactions exists in the codebase, but the frontend is untested.
- The refresh token on the app does not actually get used to gain a new access token. Need an axios pre-call hook to do this or retry on an HTTP 403 Error.
- The queryset for booklistings should simply not show books from other schools. Should only be for users in the same school.

# Release Notes

## 0.5.0

### Features
- Added ability for users to input a rating for the buyer or seller after a transaction is completed.
- Added display of user rating for buyer or seller upon viewing the user's profile.
- Added ability to sort by rating when searching for a book.
- Added ability to open meetup location in Apple Maps or Google Maps.

### Bug Fixes
- Fixed an issue where some meetup locations would cause the app to crash on Android.

### Known Bugs
- Editing user profiles may not save changed data.
- Notifications are not being sent to the backend.
- Users can still send multiple meetup requests for the same book.

## 0.4.0

### Features
- Added ability for users to specify meetup location and time when sending a meetup request.
- Added ability for sellers to view the specified meetup location and time when decided whether or not to accept a meetup request.
- Added connection fee payment with Stripe before allowing buyers to send meetup requests.
- Added connection fee payment with Stripe before allowing sellers to accept meetup requests.
- Added ability for users to view scheduled meetup requests and mark them as completed.
- Made phone number verification mandatory during sign up or sign in.


### Bug Fixes
- Book details would not always be cleared from the form after creating a new book listing.
- Fixed an issue where the "Let's Meet" screen would sometimes display the wrong name.

### Known Bugs
- Phone number verification can result in errors on failure instead of retrying.
- Users can send multiple meetup requests for the same book.

## 0.3.0

### Features
- Added ability for users to request to meet to purchase a book.
- Added ability for users to accept or decline meetup requests.
- Implemented payment processing for the connection fee with Stripe.
- Added ability for users to view meetup requests on their profile.
- Added ability for sellers to view details about buyers who request their book.
- Added verification for phone numbers used during sign up.
- Added native notification support for notifying users when a meetup request is accepted or declined.

### Bug Fixes
- Fixed an issue where users would be signed out if they had no internet connection.
- Fixed university selection so that users now select them from a list.

### Known Bugs
- API requests do not automatically retry when they fail with a network error.

## 0.2.0

### Features
- Added ability to create accounts and sign in to existing accounts.
- Added ability to add Universities that users can select when signing up.
- Added details to Users, including:
  - First Name
  - Last Name
  - University
  - Email
  - Phone Number
  - Profile Picture
  - Password
- Added admin management for users and universities.
- Added backend functionality for tracking user ratings on completed book listings.
- Utilize JSON Web Tokens to keep users signed in and authenticate for protected routes.
- Added ability for users to view and edit their own profile.
  - Upon editing a profile, users can edit the following:
    - First Name
    - Last Name
    - University
    - Profile Picture
    - Phone Number
- Added abilty for users to view the profile of a book listing's owner.

### Bug Fixes
- Fixed issue where users could edit Book Listings they do not own.

### Known Bugs
- Universities should be selected from a list, not entered as text.
- Having no internet connection may cause a user to be signed out when they try to open the app.

## 0.1.0

### Features
- Added ability to create new book listings.
  - Supported fields:
    - Title
    - Author
    - Edition
    - Class Number
    - Professor
    - Price
    - Description of condition
    - Image upload
- Added ability to search through book existing book listings.
  - Search by title, author, and edition.
- Added ability to inspect search results and see more detail about book listings.
- Added ability to edit existing book listings.

### Bug Fixes
- Book listings are now able to be filtered by edition.
- On Android, book listings are now able to be updated/created.
- On Android, book listings are now displayed correctly.

### Known Bugs
- N/A


# Project Structure

This project was set up using Python 3.11.6 and Node 20.9.0. Ensure you have those installed on your system to develop.
- [Python Installation](https://www.python.org/downloads/)
- [Node.js Installation](https://nodejs.org/en/download)

If you are on Mac, it may be beneficial to install XCode and the XCode developer tools to run the iOS simulator.
To develop on Android, you can install Android Studio to use the Android Simulator.
- [XCode Installation](https://apps.apple.com/us/app/xcode/id497799835)
- [Android Studio Installation](https://developer.android.com/studio)

We use React Native with Expo for the frontend, and Django for the backend. These will be installed through NPM, which comes bundled with Node.

- The React Native project with Expo is located in the `frontend` directory. `App.js` is the entrypoint.
- The Django project is located in the `backend` directory. Currently, Django's database and media settings are pretty much default. Uploaded images will be saved to your computer, and it will use SQLite. In production, we plan to use AWS S3 and RDS.

The following install guide is for developer installation. Once the apps are published on app stores, users will only need to download the app onto their phones.

## Frontend Install

To install the dependencies for the frontend, ensure you have the right version
of Node installed (you can either download the right version or install it using
the CLI tool `n`), then run the command from the frontend folder:

```shell
npm ci
```

This runs a "clean install" for the project's packages. This will ensure packages
don't get updated on accident.

Then, you can run this to start the expo server:

```shell
npm run start
```

The expo server will give you options for running the app. You can either scan the QR code to run on your phone with Expo Go or run using an iOS simulator. Android has not been tested for the sake of the demo. The backend must also be running for the frontend to operate.

## Backend Install

For all the following commands:

```shell
cd backend
```

Instead of relying on your global "pip" installs, a virtual environment has been
set up using a tool called `pipenv`. Ensure this is installed on your system/

Installing pipenv through your package manager of choice, inside the backend folder, you can then run:

```shell
pipenv sync --dev
```

This will install all the dependencies without updating any.

- Running `pipenv shell` will spawn a shell in the virtual environment.
  - You can verify that you have all the proper Python packages by doing `pip list`.
    This should have a different output inside the virtual environment compared to outside.
- Once inside the virtual environment, you can run Django commands such as `python manage.py runserver`

For setting up your local database to work properly, run the following commands:

- `python manage.py migrate` to set up your local database to match the Django model definitions.
- `python manage.py adduniversities` to populate the database with all US universities (required for users).
- `python manage.py createsuperuser` and enter details you want to use to login
  to the admin (these can be anything, and are only stored locally on your computer).
- After that, you can run `python manage.py runserver` to host the server on `localhost:8000`.
- Go to `localhost:8000/admin` to access the Django Admin where you can manage models in the database.
- Your simulator should be able to connect through localhost, but to run with a real iOS device, you will need to run:
  - `python manage.py runserver 0.0.0.0:8000` and edit `api.js` to point to your IP instead of localhost.

(Copy from GaTech Github)
