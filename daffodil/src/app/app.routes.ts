import { Routes } from '@angular/router';
import { daffExternalMatcherTypeGuard } from '@daffodil/external-router/routing';
import { ProductPageComponent } from './daff/product/components/product-page/product-page.component';
import { productResolver } from './daff/product/resolvers/product.resolver';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./daff/pages/home/home.component').then(m => m.HomeComponent) },
  {
    path: '**',
    component: ProductPageComponent,
    canMatch: [daffExternalMatcherTypeGuard('PRODUCT')],
    resolve: { product: productResolver }
  },
  { path: '**', loadComponent: () => import('./daff/pages/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
