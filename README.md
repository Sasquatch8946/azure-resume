# azure-resume
My own Azure resume, following [ACG project video.](https://www.youtube.com/watch?v=ieYrBWmkfno&t=1197s)

## Overview of Architecture
In short, this project consists of a static website hosted in an Azure storage account. I've used Azure Front Door to serve the website on a custom domain and enforce TLS. My main.js inserts a dynamic visitor counter by calling an Azure Function, which in turn retrieves and increments the counter from a Cosmos DB instance. 

## Directory Structure

- The frontend folder contains all of the HTML/CSS/Javascript.
- The api folder contains the Azure Function written in Python along with the unit tests.
- The workflow folder contains the .yml definition for the GitHub Actions used as part of the CI/CD pipeline. 

The rest of the README delves a little deeper into some of the challenges I faced along the way. I plan to occasionally update the following sections as I continue to update and improve my website.

## CSS

I largely just relied on the template provided by ACG, though I did have to do some work to get my profile picture to display correctly. I tried to make the dimensions specified in the original CSS properties work by adding the "object-fit: cover" property to the "profile-pic" class. This worked initially, but after pushing this change to my website, I noticed that it created [pixelated artifacts](https://stackoverflow.com/questions/74502978/object-fit-cover-gives-pixelated-images-on-chrome) around the edges of my image in Chromium-based browsers.

Ultimately, I ended up setting "height" to "auto" and "max-width" to 100% to preserve the [aspect ratio](https://stackoverflow.com/questions/3751565/css-100-width-or-height-while-keeping-aspect-ratio). This resulted in my image looking taller, but I figured it was better than it being stretched out or pixelated.

## Azure Function
This was probably the most daunting step for me. I originally tried to follow along with ACG's example in C#, but something was off. I was getting cryptic errors that I tried to google to no avail, as I do not know C# very well at all (maybe I'll get around to learning it some day, if I can identify a strong personal or professional reason for it; C# does offer the fastest [cold start time](https://mikhail.io/serverless/coldstarts/azure/) of any programming language supported by Azure Functions). So, I decided to develop a function in a programming language I was alrready familiar with: Python. I thought this was better, anyway, since I was particularly interested in this part of the project and wanted to exercise a bit more originality than I did with the frontend web portion. I'm more naturally inclined towards APIs and databases, I suppose.

In the first version of my function, I simply created a Cosmos DB client using the [Python SDK](https://pypi.org/project/azure-cosmos/). I was able to make the function viable in this way, but found it more difficult to write unit tests once I got to the CI/CD portion of the challenge, since I couldn't simply pass a dummy Cosmos DB document to function as a parameter.

I thought it was be good to learn how to work with the bindings, anyway, so I dove in, and along the way, switched from the Python Programming Model v1 to v2, since for some reason the latter would accept my connection string to connect to the Cosmos DB but the former would not. For a comparison of the two different program models, see the [Python developer reference for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-python?tabs=asgi%2Capplication-level&pivots=python-mode-decorators).

Currently, my Azure Function works, but I wouldn't considered it 100% optimized. I've noticed a considerable delay in the time between when the website loads and when the visitor counter populates. I'm continuing to troubleshoot this. (Perhaps I will learn C# after all.)

## Github Actions

The first time I tested my frontend.main.yml, I received the following error:

ErrorCode: BlobAlreadyExists

Did some Google-Fu and found this discussion:

https://github.com/Azure/azure-cli/issues/21477

Per the advice on there, I added '--overwrite' to this line in the .yml file:

```
az storage blob upload-batch --account-name azureresume4eva --auth-mode key -d '$web' -s frontend/ --overwrite
```

The change was effective. The next change I made to the HTML was visible after pushing my repo and refreshing the web page.

## Unit Tests

The CI/CD pipeline for the backend (Azure Function) relies on automated testing of the code, to ensure that nothing is getting pushed out that will produce undesirable or unexpected results.

I did not have any experience writing unit tests, so I spent a considerable amount of time learning about the Python unittest and Pytest libraries.

My piece of advise for this section is to follow the guidance in the "Unit testing" section of [this documentation](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-python?tabs=asgi%2Capplication-level&pivots=python-mode-configuration#unit-testing) very closely:

"For most bindings, it's possible to create a mock input object by creating an instance of an appropriate class from the azure.functions package."

It's possible to learn what class names you need by reading [the documentation on Cosmos DB input and outbindings](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-cosmosdb-v2?tabs=in-process%2Cextensionv4&pivots=programming-language-python) and paying attention to the type hints in the code samples.

Also, following [this blog post](https://chriskingdon.com/2020/11/30/the-definitive-guide-to-azure-functions-in-python-part-2-unit-testing/), we can simply mock out the output binding since we don't need to actually write to the database during our test:

```
outputDoc = Mock.mock()
```

## Bicep

I ended up deciding to use Bicep to automate the setup of all the necessary resources for this project. Its syntax seemed more friendly than ARM, which I had used for much simpler deployments previously, and does not require one to maintain a state file and modules like Terraform.

Here are the things I found that I could not create with Bicep files:

-Database item/initialization of counter.
-Static website on storage account.

## API Management (APIM)

For a while, I was a bit hesitant to make a LinkedIn post about my website because I was not comfortable with publicly exposing my Function api key. Also, as unlikely as it was, I was a bit paranoid about someone making unlimited async calls to my website/function app and driving up my Azure bill. 

To help mitigate these concerns, I deployed an Azure API Management instance, so I could both obscure the true url/key of my function app and implement rate limiting. 

Here's documentation on how to create APIM policies to set request headers (to insert the Function key) and to enforce rate limiting. 

[How to set request headers in Azure APIM.](https://learn.microsoft.com/en-us/azure/api-management/set-query-parameter-policy)

[How to rate limit.](https://learn.microsoft.com/en-us/azure/api-management/rate-limit-policy)

## Azure App Service

Eventually, I'd like to migrate my website from Azure Storage to Azure App Service so I can completely avoid exposing any URLs in my frontend code and also restrict access to my Function App to authenticated calls only. I would be able to enforce authentication because Azure App Service supports managed identities, whereas Azure Storage Static Websites do not. 

I refactored my app to use the Python web framework Flask, but I encountered an issue after adding the Flask app as an endpoint to Azure Front Door, namely, the visitor counter was getting cached somewhere and was only updating whenever the app got restarted (usually after coming out of hibernation). I tried preventing caching by adding the below environment variables, but it did not work. 

WEBSITE_DYNAMIC_CACHE: 0
WEBSITE_LOCAL_CACHE_OPTION: Never

So, I reverted to using Azure Storage until I could figure this out. 

My next plan of attack is to see if there is something I can configure within my Python code to prevent caching. 

The suggestion here looks promising. 
