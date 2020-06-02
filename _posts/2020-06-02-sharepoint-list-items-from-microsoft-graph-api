---
layout: post
title: How to access SharePoint List items from the Microsoft Graph
date: 2020-06-02 10:10:00.000000000 +00:00
type: post
published: true
status: publish
categories: []
tags:
- microsoft graph
- sharepoint online
- sharepoint lists
author: David Simpson

---

A while back, on Stack Overflow someone asked how to access SharePoint List items from the Microsoft Graph - this is [my answer](https://stackoverflow.com/questions/43759346/list-items-empty-when-requested-via-microsoft-graph/54555627#54555627).

# Question

## List Items empty when requested via Microsoft Graph

> I'm trying to get the list of items from a sharepoint list via Microsoft Graph.
> This is the method I'm using to get the application token:
> 
>         public async Task<string> GetAppToken(string tenantId, string clientId, string clientSecret)
>         {
>             var host = "https://login.microsoftonline.com";
>             var tokenUri = $"/{tenantId}/oauth2/v2.0/token";
>             var contentType = "application/x-www-form-urlencoded";
>     
>             var requestedResource = "https%3A%2F%2Fgraph.microsoft.com%2F.default";//&resource=https%3A%2F%2Fgraph.microsoft.com%2F.default
>             var request = $"grant_type=client_credentials&client_id={clientId}&client_secret={clientSecret}&scope={requestedResource}";
>             var resultContent = "fail";
>             using (var client = new HttpClient())
>             {
>                 client.BaseAddress = new Uri(host);
>                 var content = new StringContent(request, Encoding.UTF8, contentType);
>     
>                 var result = await client.PostAsync(tokenUri, content);
>                 resultContent = await result.Content.ReadAsStringAsync();
>     
>             }
>             var json = JsonConvert.DeserializeObject<dynamic>(resultContent);
>             return json.access_token;
>         }
> 
> The access token returned contains these roles:
> 
>     "Mail.ReadWrite",
>     "Device.ReadWrite.All",
>     "User.ReadWrite.All",
>     "Domain.ReadWrite.All",
>     "Calendars.Read",
>     "Group.Read.All",
>     "Directory.ReadWrite.All",
>     "MailboxSettings.Read",
>     "Contacts.ReadWrite",
>     "Group.ReadWrite.All",
>     "Notes.Read.All",
>     "User.Invite.All",
>     "Files.ReadWrite.All",
>     "Directory.Read.All",
>     "User.Read.All",
>     "Files.Read.All",
>     "Mail.Read",
>     "Calendars.ReadWrite",
>     "Mail.Send",
>     "MailboxSettings.ReadWrite",
>     "Contacts.Read",
>     "IdentityRiskEvent.Read.All",
>     "Member.Read.Hidden",
>     "Reports.Read.All",
>     "Notes.ReadWrite.All"
> 
> This is the code I'm using to make the request:   
> 
>     token = await GetAppToken();
>     var client = new HttpClient();
>     var queryString = new NameValueCollection();
>     client.DefaultRequestHeaders.Authorization
>         = new AuthenticationHeaderValue("Bearer", token);
>     
>     var uri = $"https://graph.microsoft.com/beta";
>     var path = $"/sites/{siteId}/lists/{listId}/items";
>     
>     var responseString = string.Empty;
>     try
>     {
> 
>         var response = await client.GetAsync($"{uri}{path}");
>         if (response.Content != null)
>         {
>             responseString = await response.Content.ReadAsStringAsync();
>             Console.WriteLine(responseString);
>         }
> 
>     }
>     catch (Exception ex)
>     {
>         Console.Write(ex.ToString());
>     }
> 
> This url works to produce a response:
> 
>     > var path =
>     > "/sites/[sitecol-guid],[site-guid]/lists/[list-guid]/items";  
> 
> But the **values** collection is empty even though there are items in the list.
> This is the actual json result:  
> 
>     {
>         "@odata.context":"graph.microsoft.com/beta/$metadata#sites(‌​'host, site-id')/lists('list-id')/items",
>         "value":[]
>     } 
> 
> I also tried this format for the list request:   
> 
>     var path = "https://graph.microsoft.com/beta/sharepoint:/{list-path}"  
> This produced a valid json response detailing the list information but when I added on the /items segment, I got this error:
> 
> > "Resource not found for the segment 'items'.",
> 
> 
> 
> What am I missing?
> 

---

# Answer
This is something that's taken me a while to figure out from the docs.

Firstly, don't do anything programmatically until you've got it working on the [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) - it is just a big waste of time.

Secondly, the beta version is not ready for your production system , so while it works well, don't rely on it, instead use v1.0 of the REST APIs.

If you know the ID of your site and list, then all URLs will start with one of the following:

	https://graph.microsoft.com/v1.0/sites/{siteId}/lists/{listId}/
	https://graph.microsoft.com/beta/sites/{siteId}/lists/{listId}/

***Note:** In the examples below, I give the generic URL, then a real world one which worked for me - so you can see what the format looks like.*
	
If you don't know the `listId`, lets say we're looking at lists in the root site, we can get them by using this URL in the [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) and click **Run Query**:

	https://graph.microsoft.com/v1.0/sites/{siteId}/lists
	https://graph.microsoft.com/v1.0/sites/root/lists

If you want to get all the columns in your list, paste this URL in the [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) and click **Run Query**

	https://graph.microsoft.com/v1.0/sites/{siteId}/lists/{listId}/columns
	https://graph.microsoft.com/v1.0/sites/root/lists/ff34268a-d9ff-49c0-99a9-75c6b2eee62e/columns
	
This returns something similar to:

	{
	    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#sites('root')/lists('ff34268a-d9ff-49c0-99a9-75c6b2eee62e')/columns",
	    "value": [
	        {
	            "columnGroup": "Custom Columns",
	            "description": "",
	            "displayName": "Title",
	            "enforceUniqueValues": false,
	            "hidden": false,
	            "id": "fa564e0f-0c70-4ab9-b863-0177e6ddd247",
	            "indexed": false,
	            "name": "Title",
	            "readOnly": false,
	            "required": true,
	            "text": {
	                "allowMultipleLines": false,
	                "appendChangesToExistingText": false,
	                "linesForEditing": 0,
	                "maxLength": 255
	            }
	        },
			...
		]
	}	

To get the value of what's in your list, use this:

	https://graph.microsoft.com/v1.0/sites/{siteId}/lists/{listId}/items?expand=fields
	https://graph.microsoft.com/v1.0/sites/root/lists/ff34268a-d9ff-49c0-99a9-75c6b2eee62e/items?expand=fields

Note the `expand=fields` query which actually adds the values of the items in your list

This returns something similar to:

	{
	    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#sites('root')/lists('ff34268a-d9ff-49c0-99a9-75c6b2eee62e')/items",
	    "value": [
	        {
	            "@odata.etag": "\"6a84a626-dae9-40eb-9c6d-899c6a05ffa8,3\"",
	            "createdDateTime": "2017-01-03T11:11:42Z",
	            "eTag": "\"6a84a626-dae9-40eb-9c6d-899c6a05ffa8,3\"",
	            "id": "1",
	            "lastModifiedDateTime": "2017-01-10T18:24:58Z",
	            "webUrl": "https://myexample.sharepoint.com/Lists/Some%20Contacts/1_.000",
	            "createdBy": {
	                "user": {
	                    ...
	                }
	            },
	            "lastModifiedBy": {
	                "user": {
	                    ...
	                }
	            },
	            "parentReference": {},
	            "contentType": {
	                "id": "0x010062202D579C40994CA18FDBA6760B9545"
	            },
	            "fields@odata.context": "https://graph.microsoft.com/v1.0/$metadata#sites('root')/lists('ff34268a-d9ff-49c0-99a9-75c6b2eee62e')/items('1')/fields/$entity",
	            "fields": {
	                "@odata.etag": "\"6a84a626-dae9-40eb-9c6d-899c6a05ffa8,3\"",
	                "Title": "Dr",
	                "First_x0020_Name": "David",
	                "Surname": "Simpson",
	                "Location": "Nottingham",
	                "First_x0020_Created": "2017-01-03T08:00:00Z",
	                "Age@odata.type": "#Single",
	                "Age": 25,
	                "id": "1",
	                "ContentType": "Item",
	                "Modified": "2017-01-10T18:24:58Z",
	                "Created": "2017-01-03T11:11:42Z",
	                "AuthorLookupId": "11",
	                "EditorLookupId": "11",
	                "_UIVersionString": "1.0",
	                "Attachments": false,
	                "Edit": "",
	                "LinkTitleNoMenu": "Dr",
	                "LinkTitle": "Dr",
	                "ItemChildCount": "0",
	                "FolderChildCount": "0",
	                "_ComplianceFlags": "",
	                "_ComplianceTag": "",
	                "_ComplianceTagWrittenTime": "",
	                "_ComplianceTagUserId": ""
	            }
	        },
			...
		]
	}	
	

Though I'm using v1.0 of the graph, the beta works just the same.

In my actual app, I'm using `offline_access Sites.ReadWrite.All` as the scope for the OAuth dance. The former allows for token refresh; the latter for access to SharePoint Online in the Microsoft Graph.

Your authorize URL should look something like this:

	https://login.microsoftonline.com/common/oauth2/v2.0/authorize
		?client_id=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX
		&response_type=code
		&redirect_uri=https%3A%2F%example.ngrok.io%2Foauth2%2Fcallback
		&response_mode=query
		&scope=offline_access+openid+Sites.ReadWrite.All
		&prompt=consent

---

**An aside:** Make sure you are using the Microsoft Graph API (at https://graph.microsoft.com/) rather than the Azure AD Graph API (at https://graph.windows.net/). If you put the wrong scope in your OAuth dance, [bad things will happen](https://blogs.msdn.microsoft.com/wushuai/2016/09/14/the-difference-between-the-tokens-used-by-microsoft-graph-and-azure-ad-graph/).

One good thing about using the Microsoft Graph API is that you don't have to bother adding any permissions in the Azure portal beforehand, because you can just add the permissions into the OAuth scope and reauth. This is much easier.
