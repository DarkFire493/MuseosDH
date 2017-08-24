class Pet < ApplicationRecord
  mount_uploader :image, ImageUploader
  has_many :horarios, dependent: :destroy
  has_many :paquetes, dependent: :destroy
  has_many :precios, dependent: :destroy
end
