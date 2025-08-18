advice from "why most analytics efforts fail" by crystal widjaja:

Making information actionable isn't about reporting on the number of people that do something, it is about how we separate what successful people do vs what failed people do in our products so that we can take steps towards improvements

To get into the mindset of the business user, there are four levels of questions I go through. For each question I have provided some examples from a product I recently worked with named Honeydu which is a way for companies to send and receive invoices online for free.

What are the business [[goals]] and objectives?

What are the key results and metrics that the business and executive team is optimizing for? Sources of this information would be current and historical [[OKR]]'s, quarterly and yearly planning documents, and board decks.

Example One: X new users receiving/sending an invoice by end of Q4 2020

Example Two: X% of invoices sent to new users lead to a new user sign up

Example Three: X recurring invoices active by end of Q4 2020

What are the objectives and [[goals]] of each team?

The high level [[goals]] of the company isn't enough. Each team will typically have a set of objectives and [[goals]] that ladder up to the company level metrics.

To understand these objectives and [[goals]] you can seek out each team's [[OKR]]'s, talk to the team leaders, etc.

Here you want to both understand what they were for a few time periods historically and what the team leaders are thinking they might be for a few time periods in the future.

Example One: (New User Growth) 2 invoices sent within the first 7 days

Example Two: (Payment Integrations) 85% of new payment methods added are successfully verified

Example Three: (NUX) % of New Users starting with an invoice templateWhat are the product experiences around these [[goals]] and objectives?

What are the product experiences around these [[goals]] and objectives?

Next, for each of the [[goals]]/objectives I identify the product experiences that correspond with driving those [[goals]]/objectives.

It is important to not just identify what the specific screen of the product or the [[funnel]], but the context of the experience that might influence the goal or action.

For example, in a ride sharing product like Uber, if the product experience was booking a ride, in addition to the [[funnel]] of booking a ride I might want to understand how many drivers were on the map? Or, what the estimated time was?

Step 1: In Honeydu, lots of different factors could lead to a user sending their first invoice, our core action.

We'd ask ourselves:

When a user is selecting a contact to send an invoice to, are they more likely to be successful when a contact is available on the user's list of historical Businesses or when they need to search?

What are the supporting actions that help users create and send their first invoice? Are invoice templates a good way of accelerating the time-to-send? Or is it more important that their contacts are imported first?

Step 2: The next step is to think through the experiences that could prevent users from reaching our [[goals]] and objectives.

In Honeydu's case, I'd ask: Why didn't a new user successfully create their first invoice? Did they look at different templates and not find one that was relevant to them? Did they try creating an invoice from scratch and find it too difficult to go back to our template directory? What actions did our activated users perform that non-activated users did NOT perform?

Step 3: Finally, imagine that any event could be the last event that we'd ever track from the user in our product. What would we want to know about this experience? We would need to know if they were given a "No Results Found" page after a contact search, or an error while adding a new payment method, and use the popularity of these events to begin triaging issues in our user experience.

What are the questions/hypotheses I/they might want to answer around these [[goals]] and product experiences?

Next, I think about what questions or hypotheses they (or I) might have around those [[goals]] or objectives.

Similarly here, talk to team leads or individual contributors on the team about what questions they faced. But also think through yourself, come up with hypotheses of questions, and validate the importance level of those questions with that team.

Example One: One of the key [[goals]] and product experiences on Honeydu is when someone sends their first invoice. I'd ask the question, what experiences do I think need to happen in order for someone to feel confident about sending their invoice to a business?

Hypotheses like "they need out with one of our industry-approved templates" or "they see the business already listed in the Honeydu network" indicate experiences that we need to be able to track in order to quantify and move on from hypotheses to confidence in correlation/causation.

Example Two: The more users that pay an invoice through Honeydu, the more revenue we generate. We should track at what point users are most likely to pay an invoice, asking ourselves "When are users most likely to pay an invoice through Honeydu? When it's due today? Tomorrow?"

By tracking the daysTillDueDate [[property]] on the Pay Invoice Successful event, we can inform and build our push notification and email strategy for users who don't organically reach the experience of seeing an invoice's due date without spamming them outside of their natural inclinations.

While we use the [[goals]] and objectives from step one as an input into what we track, stopping there ends up in bad event tracking.

Bad event tracking often looks like the individual asked themselves “can I calculate all my [[OKR]]s with these metrics” e.g. # users clicking sign up, # completing order, conversion between Sign Up and Completed. The problem with this is that it’s going to lead to dead ends. You will be able to know “50% of my users signed up” but won’t be able to ask “why?”

To answer the question of "why?" you first need to understand the journey of intent, success, and failure and then the context for each of those events in the journey (which we'll track with properties in step 3).

A couple of quick examples showing the event journey of Intent → Success → Failure:

Example One: adding a payment method

Intent: Add New Payment Method Selected & Add New Payment Details Submitted

Success: Add New Payment Method Successful

Failure: Add New Payment Method Failed

Example Two: sending an invoice

Intent: Create Invoice Selected → New Invoice Started → Contact Search

Success: Recipient Added to Invoice → Invoice Sent

Failure: Invoice Draft Saved (a default action)

I first think through the success events. A success event is when an action in the product has been completed successfully. These events stem from the business [[goals]] that I collect in step one.

Examples of success events might include:

Payment Successful

Signup Successful

Invoice Sent

Booking Completed

In order to not go overboard and track everything, I pressure test each event with a question. "Imagine I did track this, and 99% of users did it, what would I do about it? What does it tell me?" If I'm unable to to find something actionable on the extreme, then the event is likely unhelpful.

For each success event, I then think through the intent events. An intent event is often a step required as the precursor to any success event. Tracking intent events are critical to understanding the "why" around the success events.

In order to come up with the intent events I ask - what are the steps I have to complete in order to complete the success event?

I also use Intent Events to identify the paths that a user naturally takes while completing an action. For example, with our invoicing and bill payment app, do users start sending invoices by importing the contact first, or creating the invoice first? How does this behavior change as our bill payment network grows?

A failure event is something that happens between an intent event and success event that prevents the user from achieving success. In-between intent events and success events live a number of failure paths that users could encounter.

To come up with failure events I ask - What are the possible things that prevent the user from completing the goal?

There are two types of failure events:

Implicit Failures are the drop-offs that occur before the successful completion of the goal. The user just "disappears" from our journey.

In example two of our journeys above, events are tracked in a way that provides two implicit failure indicators:

Users that perform Create Invoice Selected but do not perform New Invoice Started within 5 minutes indicate a failure in our activation journey.

Users that perform Contact Search but do not perform Recipient Added to Invoice within 5 minutes indicate a failure in our search results or search history.

Users may not feel motivated enough to create a contact from scratch or found confusing results.

Explicit Failures are events where the intended experience goes wrong. Events like "Ride Cancelled" on Lyft or "Order Cancelled — Restaurant Closed" when ordering food delivery are examples of Explicit Failures

In Honeydu, Add New Payment Method Failed and Pay Invoice Failed are two examples of events that often get forgotten in the event tracking exercise because they are responses to a user's behavior, rather than actual actions taken within the product.

However, if your web/mobile app receives errors and displays them to your user, these should be easy to track and log for monitoring. Storing these error response messages as an event [[property]] is an easy way to quickly diagnose why a common user journey may suddenly be failing.

Properties are essentially ways that I might want to segment the events. A key mistake is tracking a [[segmentation]] as an event itself.

For example:

Good: Signup Up Selected (event), Source (property), Facebook (property value)

Bad: Facebook Signup Selected

A key source to understand which properties you might need to track are the questions and hypotheses you uncovered in step one.

Question Example: How do users prefer to add their contacts?

Property Example: source → History / Import / Manual Entry

Hypothesis Example: Users that are new to freelancing are more likely to use templates to get started, and will require more onboarding to get to core value than users that choose to Build Their Own invoice.

Property Example: templateName → (null)/Basic Invoice/etc.

Some high level questions I like to ask to determine which properties are important:

How will I be able to segment users who became frustrated versus disinterested?

How will I be able to identify the different paths that mature versus casual users use?

Does this give me enough nuanced data to compare and contrast successful users from dropped off users?

If this were the last event that I ever tracked from a user, what would I want to know about the user's experience on this screen?

The most common set of properties are those related to the profile of the user.

This could demographic or firmographic information.

Some examples:

City

Age

Company size

Role

Product Tier

Questions to ask to figure out which of these properties to track:

If I were to be a personal assistant for this user, what are the preferences I'd need to know about them in order to be helpful?

What demographic information might influence the behavior of a user?

The second most common set of properties are those related to marketing that might impact or influence the user's behavior.

This could include things like:

Source

Campaign

Entry Page

Another set of properties are those related to actions of the user.

For example:

First Purchase Date

First Service Type

Total Orders

Here it is important to distinguish between two types of properties:

Set and Forget - These are properties you set once, but don't change after.

Examples would be things like First Purchase Date, First Sign Up Attribution, and Birthdate.

Append/Increment - These are properties you use to segment and create relevant, personalized user experiences.

Incremented attributes could be things like Total Purchases, Total Revenue, and so on.

Appending (and removing) user attributes allows teams to quickly identify relevant users for promotions, new updates, and experiences they've already indicated interest for.

Examples could be things like a list of restaurants you've already purchased from (food delivery), a list of stores you've favorited (hyperlocal POIs), or features the user has used.

Most events have a type associate with them. Distinguishing between the type is important to getting actionable data.

Some examples:

Ride Cancelled:

User Initiated vs System Initiated

Payment Selected:

Credit Card vs Wire Transfer

Photo Uploaded:

Camera vs Gallery

Login Successful:

Google vs Facebook vs Email vs Phone

To figure out the types I ask questions like:

Who is responsible for this conversion (or failure)?

What is responsible for this conversion (or failure)?

What are the preferences this user has in completing this action?

How would I describe the most important user journey path for this action?

What additional information could I use to predict future actions of this user based on this action?

Contextual properties are those that help me understand what might influencing the motivation of the user to complete or not complete the goal.

Some examples:

The number of drivers on the screen

The types of merchants displayed

The # of search results

Questions that I find helpful to uncover contextual properties might include:

What could influence motivation of the user to complete the goal?

How could I differentiate an increase or decrease in motivation?

Imagine this was the last event that we ever track from the user. What would we want to know about the experience?

Understanding the data is the first step, but we need to pressure test whether or not the data is actionable. Here, we should go back to list of questions and hypotheses that we generated in step one, choose a sample of them, and pressure test how we might answer those questions and hypotheses.

One exercise that I recommend the data team run regularly is what I call "Decisions Made Without Data." It's pretty simple. Every quarter we kept a list of decisions that the broader team made without data.

For example, while at Gojek a question emerged whether or not paying drivers more quickly drove driver retention.

At the time we weren't tracking the proper data to inform this question.

Someone had come up with a threshold based on their own intuition and rationale.

Uncovering that decision made without data led us to start tracking some new things in the data so that we could confirm speed of payment did drive retention and develop specific product and marketing initiatives around it.