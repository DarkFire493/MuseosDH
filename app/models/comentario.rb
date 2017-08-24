class Comentario < ApplicationRecord
  has_many :respuestum, dependent: :destroy
end
