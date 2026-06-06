require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// Bot ready event
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);

    const channel =
      guild.systemChannel ||
      guild.channels.cache.find(c => c.isTextBased());

    if (!channel) return console.log("No channel found.");

    const embed = new EmbedBuilder()
      .setTitle("🔐 Verification Required")
      .setDescription("Click the button below to verify and gain access.")
      .setColor(0x3498db);

    const button = new ButtonBuilder()
      .setCustomId("verify_button")
      .setLabel("Verify Me")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({
      embeds: [embed],
      components: [row]
    });

  } catch (err) {
    console.error("Error sending panel:", err);
  }
});

// Button interaction
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "verify_button") {
    try {
      const roleId = process.env.VERIFIED_ROLE_ID;

      const member = await interaction.guild.members.fetch(interaction.user.id);

      // Add role
      await member.roles.add(roleId);

      // Reply in server
      await interaction.reply({
        content: "✅ You are now verified!",
        ephemeral: true
      });

      // DM user
      try {
        await interaction.user.send(
          "🎉 **Verification Successful!**\n\nYou now have access to the server. Welcome!"
        );
      } catch (err) {
        console.log("User has DMs disabled.");
      }

    } catch (err) {
      console.error(err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Failed to verify. Check bot permissions.",
          ephemeral: true
        });
      }
    }
  }
});

client.login(process.env.TOKEN);
