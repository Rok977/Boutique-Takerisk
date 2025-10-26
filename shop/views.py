from django.contrib.auth import authenticate, login, logout, get_user_model, update_session_auth_hash
from django.conf import settings
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
import stripe
from stripe.error import StripeError  # ✅ Importation explicite de StripeError
import json

from .models import Product, Category, Color, Size, Order, Cart,Review  # ✅ Assurez-vous que ces modèles existent

# ✅ Vérification des URLs de succès et d'annulation Stripe
success_url = settings.STRIPE_SUCCESS_URL
cancel_url = settings.STRIPE_CANCEL_URL

stripe.api_key = settings.STRIPE_SECRET_KEY  # ✅ Assurez-vous que cette clé est définie dans settings.py

User = get_user_model()  # ✅ Modèle utilisateur personnalisé ou par défaut



def index(request):
    return render(request, 'index.html')



def shop(request):
    products = Product.objects.all()
    categories = Category.objects.all()
    colors = Color.objects.all()
    sizes = Size.objects.all()

    selected_categories = request.GET.getlist('category')
    selected_colors = request.GET.getlist('color')
    selected_sizes = request.GET.getlist('size')

    if selected_categories:
        products = products.filter(category_id__in=[int(cat) for cat in selected_categories])

    if selected_colors:
        products = products.filter(color_id__in=[int(color) for color in selected_colors])

    if selected_sizes:
        products = products.filter(size_id__in=[int(size) for size in selected_sizes])

    return render(request, 'shop.html', {
        'products': products,
        'categories': categories,
        'colors': colors,
        'sizes': sizes,
        'selected_categories': selected_categories,
        'selected_colors': selected_colors,
        'selected_sizes': selected_sizes
    })


def cart_count(request):
    count = Cart.objects.filter(user=request.user).count() if request.user.is_authenticated else 0
    return JsonResponse({"count": count})

def category(request, category_slug):
    category = get_object_or_404(Category, slug=category_slug)
    products = Product.objects.filter(category=category)

    return render(request, 'shop.html', {
        'products': products,
        'categories': Category.objects.all(),
        'selected_category': category,
    })

def shop_view(request):
    query = request.GET.get('q')
    products = Product.objects.all()
    categories = Category.objects.all()
    
    if query:
        products = products.filter(name__icontains=query)
        categories = categories.filter(name__icontains=query)
    
    return render(request, 'shop.html', {
        'query': query,
        'products': products,
        'categories': categories
    })


@csrf_exempt  # ✅ Désactive la protection CSRF uniquement pour Stripe
def create_checkout_session(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Vous devez être connecté pour payer.'}, status=403)

    cart = Cart.objects.filter(user=request.user)
    
    if not cart.exists():
        return JsonResponse({'error': 'Votre panier est vide.'}, status=400)

    line_items = []
    
    for item in cart:
        line_items.append({
            'price_data': {
                'currency': 'eur',
                'product_data': {
                    'name': item.product.name,
                    'description': item.product.description[:200],  
                },
                'unit_amount': int(item.product.price * 100),  # ✅ Convertir en centimes
            },
            'quantity': item.quantity,
        })

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=settings.STRIPE_SUCCESS_URL,  # ✅ URL correcte définie dans settings.py
            cancel_url=settings.STRIPE_CANCEL_URL,  # ✅ URL correcte définie dans settings.py
        )

        # ✅ Vérification de l'URL Stripe générée
        print(f"✅ URL Stripe générée : {session.url}")  

        return JsonResponse({'redirect_url': session.url})
    
    except stripe.error.StripeError as e:
        print(f"❌ Erreur Stripe : {str(e)}")  # ✅ Affichage de l'erreur dans la console Django
        return JsonResponse({'error': f'Erreur Stripe : {str(e)}'}, status=500)



    
def payment_success(request):
    return render(request, 'payment_success.html')

def payment_cancel(request):
    return render(request, 'payment_cancel.html')



def about(request):
    return render(request, 'about.html')

def contact(request):
    return render(request, 'contact.html')

@login_required
def account(request):
    user = request.user

    if request.method == "POST":
        update_field = request.POST.get("update_field")

        # ✅ Mise à jour de l'email
        if update_field == "email":
            new_email = request.POST.get("email")
            if new_email and new_email != user.email:
                if User.objects.filter(email=new_email).exists():
                    return JsonResponse({"success": False, "error": "Cet email est déjà utilisé."})
                else:
                    user.email = new_email
                    user.save()
                    return JsonResponse({"success": True, "updated_value": new_email})

        # ✅ Mise à jour de l'adresse
        elif update_field == "address":
            user.address = request.POST.get("address", user.address)
            user.city = request.POST.get("city", user.city)
            user.phone_number = request.POST.get("phone_number", user.phone_number)
            user.save()
            return JsonResponse({"success": True})

        # ✅ Mise à jour du mot de passe
        elif update_field == "password":
            current_password = request.POST.get("current_password")
            new_password = request.POST.get("new_password")
            confirm_password = request.POST.get("confirm_password")

            if new_password != confirm_password:
                return JsonResponse({"success": False, "error": "Les mots de passe ne correspondent pas."})
            if not user.check_password(current_password):
                return JsonResponse({"success": False, "error": "Mot de passe actuel incorrect."})

            user.set_password(new_password)
            user.save()
            update_session_auth_hash(request, user)  # ✅ Évite la déconnexion après changement de mot de passe
            return JsonResponse({"success": True})

        return JsonResponse({"success": False, "error": "Requête invalide."})

    return render(request, "account.html", {"user": user})

@login_required
def order_history(request):
    orders = Order.objects.filter(user=request.user)  # ✅ Vérification des commandes liées à l'utilisateur
    return render(request, "order_history.html", {"orders": orders})

def register(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        if User.objects.filter(email=email).exists():
            return render(request, 'register.html', {"error": "Cet email est déjà utilisé."})

        user = User.objects.create_user(email=email, password=password)  # 🔥 Vérifie que email est bien envoyé
        user.save()

        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        return redirect('account')

    return render(request, 'register.html')

def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return redirect("home")
        else:
            return render(request, "login.html", {"error": "Identifiants incorrects."})
    return render(request, "login.html")

def logout_view(request):
    logout(request)
    return redirect('home') 




def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    related_products = Product.objects.filter(category=product.category).exclude(id=product.id)[:4]
    return render(request, "product_detail.html", {
        "product": product,
        "related_products": related_products
    })

@login_required
def add_review(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    if request.method == "POST":
        rating = int(request.POST.get("rating"))
        comment = request.POST.get("comment")
        Review.objects.create(product=product, user=request.user, rating=rating, comment=comment)
    return redirect("product_detail", product_id=product.id)

def cart(request):
    cart_items = Cart.objects.filter(user=request.user) if request.user.is_authenticated else []
    total_price = sum(item.product.price * item.quantity for item in cart_items)
    return render(request, 'cart.html', {'cart_items': cart_items, 'total_price': total_price})

def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    
    if request.user.is_authenticated:
        cart_item, created = Cart.objects.get_or_create(user=request.user, product=product)
        if not created:
            cart_item.quantity += 1
            cart_item.save()
    else:
        cart = request.session.get('cart', {})
        if str(product_id) in cart:
            cart[str(product_id)] += 1
        else:
            cart[str(product_id)] = 1
        request.session['cart'] = cart  # 🔥 Sauvegarde la session
    
    return JsonResponse({'status': 'success', 'message': 'Produit ajouté !'})



def view_cart(request):
    cart_items = []
    total_price = 0

    if request.user.is_authenticated:
        # ✅ Utilisateur connecté → Charge le panier depuis la base de données
        cart = Cart.objects.filter(user=request.user)
        for item in cart:
            cart_items.append({'product': item.product, 'quantity': item.quantity})
            total_price += item.product.price * item.quantity
    else:
        # ✅ Utilisateur non connecté → Charge les produits depuis la session
        cart = request.session.get('cart', {})
        product_ids = cart.keys()
        products = Product.objects.filter(id__in=product_ids)

        for product in products:
            quantity = cart.get(str(product.id), 0)
            cart_items.append({'product': product, 'quantity': quantity})
            total_price += product.price * quantity

    return render(request, 'cart.html', {'cart_items': cart_items, 'total_price': total_price})





def update_cart(request, product_id, quantity):
    product = get_object_or_404(Product, id=product_id)

    if request.user.is_authenticated:
        # ✅ Mise à jour dans la base de données
        cart_item = Cart.objects.filter(user=request.user, product=product).first()
        if cart_item:
            cart_item.quantity = quantity
            cart_item.save()
            return JsonResponse({'status': 'success', 'message': 'Quantité mise à jour.'})
        return JsonResponse({'status': 'error', 'message': 'Produit non trouvé dans le panier.'})
    
    else:
        # ✅ Mise à jour dans la session (panier temporaire)
        cart = request.session.get('cart', {})
        if str(product_id) in cart:
            cart[str(product_id)] = quantity
            request.session['cart'] = cart
            return JsonResponse({'status': 'success', 'message': 'Quantité mise à jour.'})

    return JsonResponse({'status': 'error', 'message': 'Produit non trouvé dans le panier.'})

def remove_from_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if request.user.is_authenticated:
        # ✅ Supprime de la base de données (pour les utilisateurs connectés)
        cart_item = Cart.objects.filter(user=request.user, product=product)
        if cart_item.exists():
            cart_item.delete()
            return JsonResponse({'status': 'success', 'message': 'Produit supprimé du panier.'})

    else:
        # ✅ Supprime de la session (pour les utilisateurs non connectés)
        cart = request.session.get('cart', {})
        if str(product_id) in cart:
            del cart[str(product_id)]
            request.session['cart'] = cart
            return JsonResponse({'status': 'success', 'message': 'Produit supprimé du panier.'})

    return JsonResponse({'status': 'error', 'message': 'Produit non trouvé dans le panier.'})






def search(request):
    query = request.GET.get('q', '').strip()
    results = []

    if query:
        products = Product.objects.filter(name__icontains=query)[:5]
        results = [{'id': product.id, 'name': product.name} for product in products]

    return JsonResponse({'results': results})



def filter_products(request):
    if request.method == "POST":
        data = json.loads(request.body)
        products = Product.objects.all()

        if data.get("category"):
            products = products.filter(category__id__in=data["category"])
        if data.get("color"):
            products = products.filter(color__id__in=data["color"])
        if data.get("size"):
            products = products.filter(size__id__in=data["size"])

        product_list = [{
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "image": product.image.url,
            "category": product.category.name,
            "color": product.color.name,
            "size": product.size.name
        } for product in products]

        return JsonResponse({"products": product_list})

    return JsonResponse({"error": "Méthode non autorisée"}, status=400)
