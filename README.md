# Product Information Management (PIM) System

## Overview

The Product Information Management (PIM) System is designed to streamline and enhance the management of product data across various platforms. This system allows for efficient data collection, cleaning, classification, and seamless integration with other applications.

## Features

- **Data Collection:** Automated collection of product information from various sources.
- **Data Cleaning:** Utilizes AI-powered tools to ensure the accuracy and consistency of product data.
- **Category Classification:** Smart classification of products into categories and subcategories using advanced algorithms.
- **Weight Conversion:** Automatic conversion of product weights to standardized units.
- **Image URL Updates:** Efficiently manages and updates product images using Cloudinary.
- **Approval Workflow:** Facilitates an approval process for new and updated product information.

## AI Integration with OpenAI

The PIM system leverages OpenAI's capabilities to enhance several key functionalities:

- **Natural Language Processing (NLP):** Implement NLP tasks using the OpenAI API to analyze and understand product descriptions and attributes.
- **Data Standardization:** Utilize AI for cleaning and standardizing product data, improving data quality across the platform.
- **Attribute Extraction:** Automatically extract relevant product attributes from unstructured data using advanced language models.

### Implementation Details

1. **OpenAI API Integration:**

   - The system connects to OpenAI's API to perform various AI tasks. Ensure you have the API key and proper configuration set in your environment.
   - Example usage of OpenAI API to analyze product descriptions and classify them into appropriate categories.

2. **Bulk Editing:**

   - Implement bulk-editing functionalities using AI to suggest changes or corrections to product attributes.

3. **Daily Market Price Updates:**
   - AI models will assist in fetching and updating market prices to keep product information current.

## Technologies Used

- **Frontend:** React.js
- **Backend:** Node.js with Express
- **Database:** MongoDB
- **Image Management:** Cloudinary
- **AI Integration:** OpenAI API

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)

## Features

- Dynamic fetching of manufacturers, brands, categories, and subcategories.
- Intuitive approval workflow for product submissions.
- Validation of required fields with clear error messages.
- User-friendly interface with loading indicators for improved experience.
- Support for managing product variants and weight.
- Conditional rendering for rejection reasons based on status.

## Installation

To set up the PIM system locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/spacesio-org/PIM-AI.git
   ```

2. Navigate to the project directory:

   ```bash
   cd PIM-AI
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the application.

6. These details are required for the frontend to render:

   ```bash
   VITE_OPENAI_API_KEY = "put your openAI API key here"
   ```

7. These details are required for a successful database connection and auth process:
   ```bash
   MONGO_URI = "your mongodb url here"
   PORT = "should be 3000"
   JWT_SECRET = "your jwt secret goes here"
   CLOUDINARY_CLOUD_NAME = 'cloudinary cloud name'
   CLOUDINARY_API_KEY = 'cloudinary API key'
   CLOUDINARY_API_SECRET = 'cloudinary API secret'
   ```

## Usage

The PIM system allows users to manage product information efficiently. Users can:

- Submit product details via the approval form.
- Select manufacturers and brands from dynamically fetched lists.
- Choose product categories and subcategories with a simple search interface.
- View and update existing product information.

## API Endpoints

The following API endpoints are used to manage product information:

- **GET /api/v1/manufacturer**: Retrieve a list of manufacturers.
- **GET /api/v1/categories**: Retrieve a list of categories.
- **GET /api/v1/categories/:categoryName/subcategories**: Retrieve subcategories for a given category.

### Example Request
