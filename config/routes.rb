CoverScribble::Application.routes.draw do
  root :to => "home#index"
  match '/auth/:provider/callback' => 'sessions#create'
  match '/signin' => 'sessions#new', :as => :signin
  match '/signout' => 'sessions#destroy', :as => :signout
  match '/auth/failure' => 'sessions#failure'

  get '/cover_photos.:format' => "cover_photos#show", :as => :app
  post '/cover_photos' => "cover_photos#create", :as => :create_cover_photo

end
