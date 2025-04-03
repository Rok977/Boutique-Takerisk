from django.urls import path
from . import views
from .views import (
    add_to_cart, view_cart, remove_from_cart, shop, register,
    login_view, logout_view, account, order_history, search,create_checkout_session,payment_cancel,payment_success,
    filter_products,update_cart,cart_count,add_review, 
)
from django.contrib.auth.views import PasswordChangeView, PasswordChangeDoneView

urlpatterns = [
    path('', views.index, name='index'),
    path('shop/', views.shop, name='shop'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('cart/', views.view_cart, name='cart'),  # ✅ Modification ici
    path('add-to-cart/<int:product_id>/', add_to_cart, name='add_to_cart'),
    path('remove-from-cart/<int:product_id>/', remove_from_cart, name='remove_from_cart'),
    path('update-cart/<int:product_id>/<int:quantity>/', update_cart, name='update_cart'),
    path('success/', payment_success, name='payment_success'),
    path('cancel/', payment_cancel, name='payment_cancel'),
    path('product/<int:product_id>/', views.product_detail, name='product_detail'),
    path("cart/count/", cart_count, name="cart_count"),
    path("search/", search, name="search"),  # ✅ Vérifier que cette ligne est bien là
    path("filter-products/", filter_products, name="filter_products"),
    path("add-review/<int:product_id>/", add_review, name="add_review"),  # ✅ Route pour soumettre un avis
    path('account/', account, name='account'),  # ✅ Un seul `account/`
    path("account/order_history/", order_history, name="order_history"),  # ✅ Corrigé
    path('create-checkout-session/', create_checkout_session, name='create_checkout_session'),
    

    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path("logout/", views.logout_view, name="logout"),


    # ✅ Protection du changement de mot de passe gérée dans views.py, pas ici
    path("account/password_change/", PasswordChangeView.as_view(template_name="change_password.html"), name="password_change"),
    path("account/password_change/done/", PasswordChangeDoneView.as_view(template_name="password_change_done.html"), name="password_change_done"),
]
