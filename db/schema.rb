# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170824164513) do

  create_table "comentarios", force: :cascade do |t|
    t.string "nombre"
    t.string "correo"
    t.string "comentario"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "efemerides", force: :cascade do |t|
    t.integer "numero"
    t.string "descripcion"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "eventos", force: :cascade do |t|
    t.string "nombre"
    t.datetime "fecha"
    t.string "descripcion"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "events", force: :cascade do |t|
    t.string "title"
    t.date "start"
    t.date "end"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "horarios", force: :cascade do |t|
    t.string "dia"
    t.time "horai"
    t.time "horaf"
    t.integer "pet_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["pet_id"], name: "index_horarios_on_pet_id"
  end

  create_table "paquetes", force: :cascade do |t|
    t.string "nombre"
    t.string "tipo"
    t.string "descripcion"
    t.integer "pet_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["pet_id"], name: "index_paquetes_on_pet_id"
  end

  create_table "pets", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "image"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "pins", force: :cascade do |t|
    t.string "nombre"
    t.string "photo"
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "precios", force: :cascade do |t|
    t.integer "precio"
    t.string "tipo"
    t.integer "pet_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["pet_id"], name: "index_precios_on_pet_id"
  end

  create_table "respuesta", force: :cascade do |t|
    t.string "nombre"
    t.string "correo"
    t.string "descripcion"
    t.integer "comentario_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["comentario_id"], name: "index_respuesta_on_comentario_id"
  end

  create_table "segundarespuesta", force: :cascade do |t|
    t.string "nombre"
    t.string "correo"
    t.string "descripcion"
    t.integer "respuesta_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["respuesta_id"], name: "index_segundarespuesta_on_respuesta_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

end
