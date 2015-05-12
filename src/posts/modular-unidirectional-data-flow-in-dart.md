---
title: "Modular Unidirectional Data Flow in Dart"
date: 2015-04-10
draft: false
template: post.hbt

// src: https://www.flickr.com/photos/mithril/2784737757/
banner_image: wood_architecture.jpg

intro: An architecture pattern for building infinitely nestable modules in Dart and React. After reading this post, I think you'll find the pattern to be simple, elegant, and will ultimately allow you to create complex web applications that stay modular.
---

In this post, I'll outline an architecture pattern for building infinitely nestable modules in Dart and React. It's inspired by the [Elm Architecture], but is tailored to support a non-functional language like Dart. This pattern can also be applied to React application written in non-Dart languages, like JavaScript, with the support of a reactive library like RxJS or Bacon.

An important goal of this pattern was to make use of Dart's static type analysis as much as possible. Something I found frustrating with Flux was the lack of typing for actions and their payload data. Of course, you could create classes for each action, but the number of classes you'd need to create can quickly become large as the size of your application grows.

With that in mind, I think you'll find this pattern to be simple, elegant, and will ultimately allow you to create complex web applications that stay modular.

To get started, I'll introduce the basic pattern, then use it to build a web app with a single component. After that we'll modify the app to reuse the component in a dynamic list.

## The Basic Pattern

Each module is a Dart library that's separated into three parts: a state, a view and actions.

### View

The view is a React component that is passed two properties by its parent module. An `actions` property that the view uses to change the application's state, and a `state` field which encapsulates the state of the view.

```dart
class MyView extends react.Component {
  StreamController<Action<State>> get _actions => props["actions"];
  State get _state => props["state"];

  render() {
    // render the view
  }
}
```

### State

The state is a simple immutable value object that encapsulates the state of a component.

```dart
class State {
  final String value;

  State(this.value);
}
```

### Actions

Actions are functions that return closures to modify the state of a component. The returned function accepts a single argument of the state to modify, and returns a new object representing the modified `State`.

```dart
typedef T Action<T>(T state);

Action<State> appendValue(String value) {
  return (State state) => new State(state.value + value);
}
```

In Flux parlance, the `appendValue` function is the payload's action type, its arguments is the payload's data and the returned closure is the means of modifying the state. With this technique, we remove the need to perform a `switch` statement on the type of action, and also get type checking for the action's payload data.

## Example: A Single Counter

The first example is a counter that can be incremented and decremented.

I recommend creating a single library for each module that contains its state, view and actions. This makes using the module a one-line import, and also makes [lazy loading] the module a whole lot easier.

```dart
// lib/views/counter.dart
library counter_demo.views.counter;

import 'dart:async';
import 'package:react/react.dart';

part 'counter/actions.dart';
part 'counter/state.dart';
part 'counter/view.dart';
```

Our state for this component is pretty simple. It has a single field which represents the current value.

```dart
// lib/views/counter/state.dart
part of counter_demo.views.counter;

class State {
  final int value;

  State(this.value);
}
```

The actions for this component are pretty straight forward as well. We have two actions, one for incrementing and one for decrementing the count.

```dart
// lib/views/counter/actions.dart
part of counter_demo.views.counter;

Action<State> increment() {
  return (State state) => new State(state.value + 1);
}

Action<State> decrement() {
  return (State state) => new State(state.value - 1);
}
```

What's great about these actions is that they're stateless. This makes them easier to reason about, but also easier to test. We can create a `State` object, pass it to one of our actions and test its result.

Finally, we define the render function for our React component, and setup each of the buttons to add their action onto the `actions` controller.

```dart
// lib/views/counter/view.dart
part of counter_demo.views.counter;

var view = registerComponent(() => new View());

class View extends Component {
  StreamController<Action<State>> get _actions => props["actions"];
  State get _state => props["state"];

  render() {
    return div({}, [
      div({}, _state.value),
      div({}, [
        button({"onClick": (_) => _actions.add(decrement())}, "Decrement"),
        button({"onClick": (_) => _actions.add(increment())}, "Increment")
      ])
    ])
  }
}
```

## The Update Loop

So far we've defined a component that has a state, a view, and a set of actions. But, we're not responding to the actions added to the `StreamController`. Let's go over how actions modify the application's state, and how this triggers a rerender of the view.

Generally speaking, your application's state is held inside a `scan` stream. This stream transformer isn't provided by Dart, so we use [Frappe] to provide this functionality.

Using a `scan` stream is nice, because it will hold the current state for us, but also modify the state whenever an action is added to the controller. We can also listen for changes to the stream and trigger side effects, like rerendering the view or updating the browser's URL with the history API.

```dart
import 'dart:html';
import 'package:frappe/frappe.dart';
import 'package:react/react.dart' as react;
import 'package:react/react_client.dart' as react_client;
import 'package:counter/views/counter.dart' as counter;

void main() {
  react_client.setClientConfiguration();

  var applicationElement = querySelector("#application");
  var initialState = new counter.State(0);

  var actionsSink = new StreamController<Action<counter.State>>();
  var actions = new EventStream<Action<counter.State>>(actionsSink.stream);
  var state = actions.scan(initialState, (state, action) => action(state));

  state.listen((state) {
    var view = counter.view({"state": state, "actions": actionsSink});
    react.render(view, applicationElement);
  });
}
```

There's a bit going on here, so lets break down reacting to the actions from our view and updating the application's state.

* We define the initial state of our application, with a starting count of 0, and assign it to `initialState`.
* We define a `StreamController`, assign it to `actionsSink`, and pass it to our view. The view will request changes to the application state by adding actions onto this `StreamController`.
* We use Frappe's `scan` transformer to apply actions from our view to the previous state of the application.
* We listen to the `state` stream and rerender the view whenever it has changed.

You can think of this process as an endless cycle of `Render -> User Action -> State Modification -> Render`.

## Example: Many Counters

Lets try to stress the architecture a bit by introducing a dynamic list of counters.

Our general architecture is the same, we create a new module `counter_list` that contains a state, view and set of actions. The UI for this will include a button to create a new counter, a list of the inserted counters and a button to remove them.

To start, lets create a library for `counter_list`. Along with the React import, we'll also import our previous counter module and alias it as `counter`.

```dart
// lib/views/counter_list.dart
library counter_demo.views.counter_list;

import 'dart:async';
import 'package:react/react.dart';
import 'package:counter_demo/views/counter.dart' as counter;

part 'counter_list/actions.dart';
part 'counter_list/state.dart';
part 'counter_list/view.dart';
```

The state for this module will include a list of counters, and an ID to assign to the next counter.

```dart
// lib/views/counter_list/state.dart
part of counter_demo.views.counter_list;

class State {
  final Iterable<counter.State> counters;
  final int nextId;

  State(this.nextId, this.counters);
}
```

Since we want the ability to add, remove and update a counter, the module will include three actions for each of the behaviors.

```dart
// lib/views/counter_list/actions.dart
part of counter_demo.views.counter_list;

Action<State> createCounter() {
  return (State state) {
    var counter = new counter.State(state.nextId, 0);
    var counters = state.counters.toList()..insert(0, counter);
    return new State(state.nextId + 1, counters);
  };
}

Action<State> removeCounter(int id) {
  return (State state) {
    var counters = state.counters.toList()..removeWhere((counter) {
      return counter.id == id;
    });
    return new State(state.nextId, counters);
  };
}

Action<State> updateCounter(int id, Action<counter.State> action) {
  return (State state) {
    var counters = state.counters.map((counter) {
      return counter.id == id ? action(counter) : counter;
    });
    return new State(state.nextId, counters);
  };
}
```

Something to take note of is the `updateCounter` action. Here we're passing the identifier of the counter to update, and an action that returns a new counter to replace it with. This paradigm is how the state of a child module gets merged into its parent. This will become clearer once we define the view for our counter list.

```dart
// lib/views/counter_list/view.dart
part of counter_demo.views.counter_list;

var view = registerComponent(() => new View());

class View extends Component {
  StreamController<Action<State>> get _actions => props["actions"];
  State get _state => props["state"];

  render() {
    var counters = _state.counters.map((counter) => _renderCounter(counter));

    return div({}, [
      button({"onClick": (_) => _actions.add(createCounter())}, "Create a Counter"),
      div({}, counters)
    ])
  }

  _renderCounter(counter.State counter) {
    var counterActions = new StreamController();
    counterActions.stream.listen((action) {
      _actions.add(updateCounter(counter.id, action));
    });

    return div({}, [
      counter.view({"state": counter, "actions": counterActions}),
      button({"onClick": _actions.add(removeCounter(counter.id))}, "Remove")
    ]);
  }
}
```

As previously mentioned, we need to modify the states of a counter in the counter list. To handle this, we create a new stream controller for each counter view that it can add actions onto. When an action is added, we associate that action with an ID using `updateCounter` which will apply the action to the specific counter in the counter list.

## Take Aways

* Each module is built around a state, view and a set of actions. This keeps the API for each module standardized and easy to turn into a [deferred library].
* Modules can be nested infinitely, and each module is only concerned by its immediate children.
* Your application state is in a single location and serves as the source of truth when triggering side effects, such as rendering the view. This eliminates a class of bugs where the state of a component becomes out of sync with the state of the application.
* Testing is made easier from the use of immutable classes and declarative actions.

[Elm Architecture]: https://github.com/evancz/elm-architecture-tutorial
[Frappe]: https://github.com/danschultz/frappe
[lazy loading]: https://www.dartlang.org/docs/dart-up-and-running/ch02.html#deferred-loading
[deferred library]: https://www.dartlang.org/docs/dart-up-and-running/ch02.html#deferred-loading
