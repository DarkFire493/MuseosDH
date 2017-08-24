Rails.application.routes.draw do
  resources :efemerides
  resources :events
  resources :eventos
  resources :paquetes
  resources :precios
  resources :horarios
  resources :pets
  resources :respuesta
  devise_for :users
  resources :comentarios
  resources :qr_codes, only: [:new, :create]
  get 'index/principal'

  root "pets#index"
  
  get 'ras' => 'principal#ras'
  get 'ras2' => 'principal#ras2'
  get 'casahidalgo' => 'pets#casahidalgo'
  get 'casadecendienteshidalgo' => 'pets#casadecendienteshidalgo'
  get 'show' => 'pets#show'
  get 'qr_codes/new'
  get 'qr_codes/create'
  get 'principal/index'


  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
