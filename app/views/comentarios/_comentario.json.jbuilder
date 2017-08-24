json.extract! comentario, :id, :nombre, :correo, :comentario, :created_at, :updated_at
json.url comentario_url(comentario, format: :json)
