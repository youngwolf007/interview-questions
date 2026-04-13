# React Interview Questions (Readable Notes)

## 1. What is React Context?

React Context allows you to share data across components without passing props manually at every level.
Common use cases: themes, authentication, global settings.

---

## 2. What is Prop Drilling?

Prop drilling is passing data through multiple layers of components even if intermediate components don’t use it.

---

## 3. What is Hot Module Replacement (HMR)?

HMR updates modules in a running app without refreshing the page, preserving state and improving development speed.

---

## 4. What is the use of Parcel, Vite, or Webpack?

These are bundlers/build tools used to:

* Bundle code (JS, CSS, assets)
* Optimize performance
* Enable HMR and code splitting

---

## 5. How does Create React App work?

Create React App provides a pre-configured React setup with tools like Webpack and Babel, so you can start development without manual configuration.

---

## 6. What is Tree Shaking?

Tree shaking removes unused code from the final bundle to reduce size.

---

## 7. Dependency vs DevDependency

* **dependencies** → required in production
* **devDependencies** → used only in development

---

## 8. npm vs npx

* **npm** → installs packages
* **npx** → runs packages without installing globally

---

## 9. package.json vs package-lock.json

* **package.json** → lists dependencies and scripts
* **package-lock.json** → locks exact dependency versions

---

## 10. `<Component />` vs `Component()`

* `<Component />` → JSX syntax, enables React features
* `Component()` → direct function call, skips React lifecycle

---

## 11. What is React.Fragment?

A wrapper that groups elements without adding extra DOM nodes.

---

## 12. Use of return in useEffect

Used for cleanup tasks like removing event listeners or clearing timers.

---

## 13. What is Code Splitting?

Breaking the app into smaller bundles that load on demand.

**Advantage:** Faster initial load and better performance.

---

## 14. Cookies vs Local Storage vs Session Storage

* **Cookies** → small, sent with every request
* **Local Storage** → persists until cleared
* **Session Storage** → cleared when tab closes

---

## 15. Frontend Performance Optimizations

* Lazy loading
* Code splitting
* Memoization
* Image optimization
* CDN usage
* Minification & compression

---

## 16. What is Polyfill?

Code that enables modern features in older browsers.

---

## 17. What is a Bundle?

A compiled file containing your app code and dependencies.

---

## 18. What is Content Negotiation?

Client and server decide response format (JSON, XML) using headers.

---

## 19. What is Compression?

Reducing file size (e.g., Gzip, Brotli) for faster loading.

---

## 20. What is Lazy Loading?

Loading components or resources only when needed.

---

## 21. Large Image Optimization

* Compress images
* Use WebP/AVIF
* Lazy load images
* Use responsive images (`srcSet`)
* Use CDN

---

## 22. What is srcSet?

Allows browser to select the best image based on screen size/resolution.

---

## 23. useState vs useEffect

* **useState** → manages state
* **useEffect** → handles side effects

---

## 24. How to Optimize React Apps?

* Avoid unnecessary re-renders
* Use memoization
* Lazy load components
* Optimize state structure

---

## 25. Context API vs Redux

* **Context API** → simple, lightweight global state
* **Redux** → advanced, predictable state management for large apps

---
