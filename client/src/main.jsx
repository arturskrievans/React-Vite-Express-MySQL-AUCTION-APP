import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom"

import './index.css'
import Layout from './Layout.jsx'
import App from './App.jsx'
import UserPage from './UserPage.jsx'
import UploadProduct from './UploadProduct.jsx'
import Products from './Products.jsx'
import Product from './Product.jsx'
import UserProducts from './UserProducts.jsx'
import UserPurchases from './UserPurchases.jsx'
import About from './About.jsx'
import { LoginProvider } from './LoginContext.jsx'


const router = createBrowserRouter([
  { path:"/", 
    element: <Layout/>, 
    children: [
      { index: true, element: <App /> },
      { path:"/user/:username", element: <UserPage/>},
      { path:"/user/:username/new_product", element: <UploadProduct/>},
      { path:"/products", element: <Products/>},
      { path:"/product/:id", element:<Product/>},
      { path:"/user/:username/products", element:<UserProducts/>},
      { path:"/user/:username/purchases", element:<UserPurchases/>}, 
      { path:"/about", element:<About/>}
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoginProvider>
      <RouterProvider router={router}/>
    </LoginProvider>
  </StrictMode>,
)
