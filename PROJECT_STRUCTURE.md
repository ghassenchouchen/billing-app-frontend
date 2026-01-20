# Frontend Project Structure



## Folder Structure

```
src/app/
├── core/                          
│   ├── guards/                    
│   │   └── auth.guard.ts        
│   ├── interceptors/             
│   │   ├── auth.interceptor.ts   
│   │   └── error.interceptor.ts 
│   ├── models/                    
│   │   └── index.ts              
│   └── services/                  
│       ├── api.service.ts        
│       └── auth.service.ts       
│
├── shared/                        # Shared code used across features
│   └── services/                  # Business logic services
│       ├── customer.service.ts
│       ├── bill.service.ts
│       ├── contract.service.ts
│       ├── services.service.ts
│       ├── offers.service.ts
│       ├── login.service.ts
│       └── index.ts              
│
├── bills/                         # Bills feature module
│   ├── bills.component.ts
│   ├── bills.component.html
│   └── bills.component.css
│
├── contracts/                     # Contracts feature module
│   ├── contracts.component.ts
│   ├── contracts.component.html
│   └── contracts.component.css
│
├── customers/                     # Customers feature module
│   ├── customers.component.ts
│   ├── customers.component.html
│   └── customers.component.css
│
├── login/                         # Login feature module
│   ├── login.component.ts
│   ├── login.component.html
│   └── login.component.css
│
├── offers/                        # Offers feature module
│   ├── offers.component.ts
│   ├── offers.component.html
│   └── offers.component.css
│
├── services/                      # Services feature module
│   ├── services.component.ts
│   ├── services.component.html
│   └── services.component.css
│
├── app-routing.module.ts          
├── app.module.ts                  
├── app.component.ts               
└── app.component.html             
```




## Running the Application

### Development Server
```bash
npm start
# Runs on http://localhost:4200 (or next available port)
```

### Build
```bash
npm run build
# Output: dist/ folder (3.04 MB)
```

### Tests
```bash
npm test
```

## Routes

| Path | Component | Protected |
|------|-----------|-----------|
| `/Login` | LoginComponent | No |
| `/Customers` | CustomersComponent | Yes |
| `/Bills` | BillsComponent | Yes |
| `/Contracts` | ContractsComponent | Yes |
| `/Services` | ServicesComponent | Yes |
| `/Offers` | OffersComponent | Yes |

All protected routes redirect to `/Login` with a return URL when accessed without authentication.

## Technologies

- **Angular**: 12.2.17
- **TypeScript**: 4.3.5
- **RxJS**: 6.6.0
- **Angular Material**: Latest (installed)
- **Node.js**: v24.13.0 (with OpenSSL legacy provider)

## Next Steps

1. Implement Angular Material UI components
2. Add loading states to all data operations
3. Create feature modules for lazy loading
4. Add state management (NgRx/Akita)
5. Implement caching for API responses
6. Add comprehensive error messages
7. Create reusable Material components
